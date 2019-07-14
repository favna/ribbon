/**
 * @file nsfw GelbooruCommand - Gets a NSFW image from gelbooru
 *
 * Can only be used in NSFW marked channels!
 *
 * **Aliases**: `gel`, `booru`
 * @module
 * @category nsfw
 * @name gelbooru
 * @example gelbooru pyrrha_nikos
 * @param {string} Query Something you want to find
 */

import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { search as booru } from 'booru';
import { stripIndents } from 'common-tags';

type GelbooruArgs = {
  tags: string[];
};

export default class GelbooruCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'gelbooru',
      aliases: [ 'gel', 'booru' ],
      group: 'nsfw',
      memberName: 'gelbooru',
      description: 'Find NSFW Content on gelbooru',
      format: 'NSFWToLookUp',
      examples: [ 'gelbooru Pyrrha Nikos' ],
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

  public async run(msg: CommandoMessage, { tags }: GelbooruArgs) {
    try {
      const booruSearch = await booru('gelbooru', tags, {
        limit: 1,
        random: true,
      });
      const hit = booruSearch.first;
      const imageTags: string[] = [];

      hit.tags.forEach((tag: string) => imageTags.push(`[#${tag}](${hit.fileUrl!})`));

      const gelEmbed = new MessageEmbed()
        .setTitle(`gelbooru image for ${tags.join(', ')}`)
        .setURL(hit.fileUrl!)
        .setColor('#FFB6C1')
        .setDescription(stripIndents`
          ${imageTags.slice(0, 5).join(' ')}
          **Score**: ${hit.score}`)
        .setImage(hit.fileUrl!);

      deleteCommandMessages(msg, this.client);

      return msg.embed(gelEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      return msg.reply(`no juicy images found for \`${tags}\``);
    }
  }
}