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

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import cheerio from 'cheerio';
import fs from 'fs';
import Fuse from 'fuse.js';
import moment from 'moment';
import 'moment-duration-format';
import fetch from 'node-fetch';
import path from 'path';
import { capitalizeFirstLetter, DEFAULT_EMBED_COLOR, deleteCommandMessages, IFrontlineGirl, startTyping, stopTyping } from '../../components';

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

    public async run (msg: CommandoMessage, { character }: { character: string }) {
        try {
            startTyping(msg);

            const gfEmbed = new MessageEmbed();
            const gfOptions: Fuse.FuseOptions<any> = {
                shouldSort: true,
                keys: [{ name: 'name', getfn: t => t.name, weight: 1 }],
                location: 0,
                distance: 100,
                threshold: 0.6,
                maxPatternLength: 32,
                minMatchCharLength: 1,
            };
            const games = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/databases/girlsfrontline.json'), 'utf8'));
            const fuse = new Fuse(games, gfOptions);
            const results: IFrontlineGirl[] = fuse.search(character);
            const hit = results[0];
            const howObtain: string[] = [];
            const statIndices = ['hp', 'dmg', 'eva', 'acc', 'rof'];

            if (hit.production.stage) howObtain.push(`**Stage:** ${hit.production.stage}`);
            if (hit.production.reward) howObtain.push(`**Reward:** ${hit.production.reward}`);
            if (hit.production.timer) howObtain.push(`**Production Timer:** ${moment.duration(hit.production.timer, 'hours').format('H [hours and] mm [minutes]')}`);
            if (hit.production.placebo) howObtain.push('_Production requirements are placebo & may not increase drop rate_');

            hit.ability.text.match(/\(\$([a-z0-9_])+\)/gm).forEach((element: string) => {
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

            if (hit.production.timer) {
                gfEmbed
                    .addField('Normal Production Requirement', Object.keys(hit.production.normal)
                        .map(index => `**${capitalizeFirstLetter(index)}**: ${hit.production.normal[index]}`)
                        .join(', '))
                    .addField('Heavy Production Requirement', Object.keys(hit.production.heavy)
                        .map(index => `**${capitalizeFirstLetter(index)}**: ${hit.production.heavy[index]}`)
                        .join(', '));
            }

            gfEmbed
                .addField(`Ability: ${hit.ability.name}`, hit.ability.text, true)
                .addField('Tile Bonus', hit.tile_bonus, true)
                .addField('Tile Bonus Ability', hit.bonus_desc, true)
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(gfEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`no girl found for \`${character}\``);
        }
    }
}
