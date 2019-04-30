/**
 * @file Searches GirlsFrontlineCommand - Gets information about [Girls Froontline](http://gf.sunborngame.com/) characters
 *
 * **Aliases**: `gfsearch`
 * @module
 * @category searches
 * @name girlsfrontline
 * @example girlsfrontline Negev
 * @param {string} CharacterName Name (species), number or type of the girl you want to find
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { FrontlineGirlType } from '@components/Types';
import { clientHasManageMessages, deleteCommandMessages, sentencecase } from '@components/Utils';
import frontlineGirls from '@pokedex/girlsfrontline';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import cheerio from 'cheerio';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';
import 'moment-duration-format';
import fetch from 'node-fetch';

type GirlsFrontlineArgs = {
    character: string;
    hasManageMessages: boolean;
};

export default class GirlsFrontlineCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'girlsfrontline',
            aliases: ['gfsearch'],
            group: 'searches',
            memberName: 'girlsfrontline',
            description: 'Gets information about [Girls Froontline](http://gf.sunborngame.com/) characters',
            format: 'CharacterName',
            examples: ['girlsfrontline Negev'],
            guildOnly: false,
            args: [
                {
                    key: 'character',
                    prompt: 'What girl do you want me to look up?',
                    type: 'string',
                }
            ],
        });
    }

    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { character }: GirlsFrontlineArgs) {
        try {
            const gfEmbed = new MessageEmbed();
            const gfOptions: FuseOptions<FrontlineGirlType> = { keys: ['name'] };
            const fuse = new Fuse(frontlineGirls, gfOptions);
            const results = fuse.search(character);
            const hit = results[0];
            const howObtain: string[] = [];
            const statIndices = ['hp', 'dmg', 'eva', 'acc', 'rof'];

            if (hit.production.stage) howObtain.push(`**Stage:** ${hit.production.stage}`);
            if (hit.production.reward) howObtain.push(`**Reward:** ${hit.production.reward}`);
            if (hit.production.timer) howObtain.push(`**Production Timer:** ${moment.duration(hit.production.timer, 'hours').format('H [hours and] mm [minutes]')}`);

            hit.ability.text.match(/\(\$([a-z0-9_])+\)/gm)!.forEach((element: string) => {
                hit.ability.text = hit.ability.text.replace(element, (hit.ability[element.replace(/\(\$(.+)\)/gim, '$1')] as string[]).reverse()[0]);
            });

            const wikiBasePath = 'https://en.gfwiki.com';
            const wikiFetch = await fetch(wikiBasePath.concat(hit.url));
            const $ = cheerio.load(await wikiFetch.text());
            const thumbSrc = $('.gallery').find('.gallerytext > p:contains("Profile image")')
                .parent().parent().find('img').attr('src')
                .slice(1).split('/').slice(2, 5).join('/');

            gfEmbed
                .setURL(wikiBasePath.concat(hit.url))
                .setTitle(`No. ${hit.num} - ${hit.name} ${[...Array(hit.rating)].map(() => '★').join('').concat('☆☆☆☆☆'.slice(hit.rating))}`)
                .setThumbnail(wikiBasePath.concat('/images/', thumbSrc))
                .addField('Type', hit.type, true)
                .addField('Constant Stats',
                    Object.keys(hit.constStats)
                        .map(index => `${index.toUpperCase()}: **${hit.constStats[index]}**`)
                        .join(', '))
                .addField('Maximum Stats',
                    Object.keys(hit.baseStats)
                        .map(index => statIndices.includes(index) ? `${index.toUpperCase()}: **${hit.baseStats[index]}**` : undefined)
                        .filter(Boolean)
                        .join(', '))
                .addField('Base Stats',
                    Object.keys(hit.maxStats)
                        .map(index => statIndices.includes(index) ? `${index.toUpperCase()}: **${hit.maxStats[index]}**` : undefined)
                        .filter(Boolean)
                        .join(', '))
                .addField('How To Obtain', howObtain.join('\n'));

            if (hit.production.timer && hit.production.normal) {
                gfEmbed.addField('Normal Production Requirement', Object.keys(hit.production.normal)
                    .map((index: string) => `**${sentencecase(index)}**: ${hit.production.normal![index]}`)
                    .join(', '));
            }

            if (hit.production.timer && hit.production.heavy) {
                gfEmbed
                    .addField('Heavy Production Requirement', Object.keys(hit.production.heavy)
                        .map((index: string) => `**${sentencecase(index)}**: ${hit.production.heavy![index]}`)
                        .join(', '));
            }

            gfEmbed
                .addField(`Ability: ${hit.ability.name}`, hit.ability.text, true)
                .addField('Tile Bonus', hit.tile_bonus, true)
                .addField('Tile Bonus Ability', hit.bonus_desc, true)
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR);

            deleteCommandMessages(msg, this.client);

            return msg.embed(gfEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`no girl found for \`${character}\``);
        }
    }
}
