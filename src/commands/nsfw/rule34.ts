/**
 * @file nsfw Rule34Command - Gets a NSFW image from rule34
 *
 * Can only be used in NSFW marked channels!
 *
 * **Aliases**: `r34`
 * @module
 * @category nsfw
 * @name rule34
 * @example rule34 pyrrha_nikos
 * @param {string} Query Something you want to find
 */

import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { search as booru } from 'booru';
import { stripIndents } from 'common-tags';

type Rule34Args = {
  tags: string[];
};

export default class Rule34Command extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'rule34',
      aliases: ['r34'],
      group: 'nsfw',
      memberName: 'rule34',
      description: 'Find NSFW Content on Rule34',
      format: 'NSFWToLookUp',
      examples: ['rule34 Pyrrha Nikos'],
      nsfw: true,
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'tags',
          prompt: 'What do you want to find NSFW for?',
          type: 'stringarray',
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, { tags }: Rule34Args) {
    try {
      const booruSearch = await booru('r34', tags, {
        limit: 1,
        random: true,
      });
      const hit = booruSearch.first;
      const imageTags: string[] = [];

      hit.tags.forEach((tag: string) => imageTags.push(`[#${tag}](${hit.fileUrl!})`));

      const r34Embed = new MessageEmbed()
        .setTitle(`Rule34 image for ${tags.join(', ')}`)
        .setURL(hit.fileUrl!)
        .setColor('#FFB6C1')
        .setDescription(stripIndents`
          ${imageTags.slice(0, 5).join(' ')}
          **Score**: ${hit.score}`
        )
        .setImage(hit.fileUrl!);

      deleteCommandMessages(msg, this.client);

      return msg.embed(r34Embed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      return msg.reply(`no juicy images found for \`${tags}\``);
    }
  }
}
