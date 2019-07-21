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

import { CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, sentencecase } from '@components/Utils';
import frontlineGirls from '@pokedex/girlsfrontline';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, User } from 'awesome-djs';
import cheerio from 'cheerio';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';
import 'moment-duration-format';
import fetch from 'node-fetch';
import { FrontlineGirl } from 'RibbonTypes';

type GirlsFrontlineArgs = {
  character: string;
  hasManageMessages: boolean;
  position: number;
};

export default class GirlsFrontlineCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'girlsfrontline',
      aliases: [ 'gfsearch' ],
      group: 'searches',
      memberName: 'girlsfrontline',
      description: 'Gets information about [Girls Froontline](http://gf.sunborngame.com/) characters',
      format: 'CharacterName',
      examples: [ 'girlsfrontline Negev' ],
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
  public async run(msg: CommandoMessage, { character, hasManageMessages, position = 0 }: GirlsFrontlineArgs) {
    try {
      const gfOptions: FuseOptions<FrontlineGirl> = { keys: [ 'name' ] };
      const fuse = new Fuse(frontlineGirls, gfOptions);
      const girlSearch = fuse.search(character);
      const color = msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR;

      let currentGirl = girlSearch[position];
      let girlEmbed = await this.prepMessage(
        color, currentGirl, girlSearch.length, position, hasManageMessages
      );

      deleteCommandMessages(msg, this.client);

      const message = await msg.embed(girlEmbed) as CommandoMessage;

      if (girlSearch.length > 1 && hasManageMessages) {
        injectNavigationEmotes(message);
        new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
          .on('collect', async (reaction: MessageReaction, user: User) => {
            if (!this.client.botIds.includes(user.id)) {
              if (reaction.emoji.name === '➡') position++;
              else position--;
              if (position >= girlSearch.length) position = 0;
              if (position < 0) position = girlSearch.length - 1;
              currentGirl = girlSearch[position];
              girlEmbed = await this.prepMessage(
                color, currentGirl, girlSearch.length, position, hasManageMessages
              );
              message.edit('', girlEmbed);
              message.reactions.get(reaction.emoji.name)!.users.remove(user);
            }
          });
      }

      return null;
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      return msg.reply(`no girl found for \`${character}\``);
    }
  }

  private async prepMessage(
    color: string, girl: FrontlineGirl, girlsLength: number,
    position: number, hasManageMessages: boolean
  ): Promise<MessageEmbed> {
    const embed = new MessageEmbed();
    const howObtain: string[] = [];
    const statIndices = [ 'hp', 'dmg', 'eva', 'acc', 'rof' ];
    const abilityReplacer = girl.ability.text.match(/\(\$([a-z0-9_])+\)/gm);

    if (girl.production.stage) howObtain.push(`**Stage:** ${girl.production.stage}`);
    if (girl.production.reward) howObtain.push(`**Reward:** ${girl.production.reward}`);
    if (girl.production.timer) howObtain.push(`**Production Timer:** ${moment.duration(girl.production.timer, 'hours').format('H [hours and] mm [minutes]')}`);

    if (abilityReplacer) {
      abilityReplacer.forEach((element: string) => {
        girl.ability.text = girl.ability.text.replace(element, (girl.ability[element.replace(/\(\$(.+)\)/gim, '$1')] as string[]).reverse()[0]);
      });
    }

    const wikiBasePath = 'https://en.gfwiki.com';
    const wikiFetch = await fetch(wikiBasePath.concat(girl.url));
    const $ = cheerio.load(await wikiFetch.text());
    const thumbSrc = $('.gallery').find('.gallerytext > p:contains("Profile image")')
      .parent().parent().find('img').attr('src')
      .slice(1).split('/').slice(2, 5).join('/');

    embed
      .setColor(color)
      .setURL(wikiBasePath.concat(girl.url))
      .setTitle(`No. ${girl.num} - ${girl.name} ${[ ...Array(girl.rating) ].map(() => '★').join('').concat('☆☆☆☆☆'.slice(girl.rating))}`)
      .setThumbnail(wikiBasePath.concat('/images/', thumbSrc))
      .setFooter(hasManageMessages ? `Result ${position + 1} of ${girlsLength}` : '')
      .addField('Type', girl.type, true)
      .addField('Constant Stats',
        Object.keys(girl.constStats)
          .map(index => `${index.toUpperCase()}: **${girl.constStats[index]}**`)
          .join(', '))
      .addField('Maximum Stats',
        Object.keys(girl.baseStats)
          .map(index => statIndices.includes(index) ? `${index.toUpperCase()}: **${girl.baseStats[index]}**` : undefined)
          .filter(Boolean)
          .join(', '))
      .addField('Base Stats',
        Object.keys(girl.maxStats)
          .map(index => statIndices.includes(index) ? `${index.toUpperCase()}: **${girl.maxStats[index]}**` : undefined)
          .filter(Boolean)
          .join(', '))
      .addField('How To Obtain', howObtain.join('\n'));

    if (girl.production.timer && girl.production.normal) {
      embed.addField('Normal Production Requirement', Object.keys(girl.production.normal)
        .map((index: string) => `**${sentencecase(index)}**: ${girl.production.normal![index]}`)
        .join(', '));
    }

    if (girl.production.timer && girl.production.heavy) {
      embed
        .addField('Heavy Production Requirement', Object.keys(girl.production.heavy)
          .map((index: string) => `**${sentencecase(index)}**: ${girl.production.heavy![index]}`)
          .join(', '));
    }

    embed
      .addField(`Ability: ${girl.ability.name}`, girl.ability.text, true)
      .addField('Tile Bonus', girl.tile_bonus, true)
      .addField('Tile Bonus Ability', girl.bonus_desc, true);

    return embed;
  }
}