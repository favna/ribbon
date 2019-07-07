/**
 * @file nsfw E621Command - Gets a NSFW image from e621
 *
 * Can only be used in NSFW marked channels!
 *
 * **Aliases**: `eee`
 * @module
 * @category nsfw
 * @name e621
 * @example e621 pyrrha_nikos
 * @param {string} Query Something you want to find
 */

import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { search as booru } from 'booru';
import { stripIndents } from 'common-tags';

type E621Args = {
  tags: string[];
};

export default class E621Command extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'e621',
      aliases: ['eee'],
      group: 'nsfw',
      memberName: 'e621',
      description: 'Find NSFW Content on e621',
      format: 'NSFWToLookUp',
      examples: ['e621 Pyrrha Nikos'],
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

  public async run (msg: CommandoMessage, { tags }: E621Args) {
    try {
      const booruSearch = await booru('e621', tags, {
        limit: 1,
        random: true,
      });
      const hit = booruSearch.first;
      const imageTags: string[] = [];

      hit.tags.forEach((tag: string) => imageTags.push(`[#${tag}](${hit.fileUrl!})`));

      const e621Embed = new MessageEmbed()
        .setTitle(`e621 image for ${tags.join(', ')}`)
        .setURL(hit.fileUrl!)
        .setColor('#FFB6C1')
        .setDescription(stripIndents`
          ${imageTags.slice(0, 5).join(' ')}
          **Score**: ${hit.score}`
        )
        .setImage(hit.fileUrl!);

      deleteCommandMessages(msg, this.client);

      return msg.embed(e621Embed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      return msg.reply(`no juicy images found for \`${tags}\``);
    }
  }
}
