/**
 * @file Music MaxSongsCommand- The maximum amount of songs any member can queue
 *
 * Give no argument to show current amount of maximum songs. Use "default" as argument to set it back to Ribbon's
 *     default
 *
 * **Aliases**: `songcap`, `songmax`, `maxsong`
 * @module
 * @category music
 * @name maxsongs
 * @example maxsongs 2
 * @param {number | "default"} [NumberOfSongs] New maximum number of songs
 */

import { MAX_SONGS } from '@components/Constants';
import { deleteCommandMessages, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { oneLine } from 'common-tags';

export default class MaxSongsCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'maxsongs',
      aliases: [ 'songcap', 'songmax', 'maxsong' ],
      group: 'music',
      memberName: 'maxsongs',
      description: 'Shows or sets the max songs per user.',
      format: '[amount|"default"]',
      details: oneLine`
                This is the maximum number of songs a user may have in the queue.
                The default is ${MAX_SONGS}.
                Only administrators may change this setting.
              `,
      examples: [ 'maxsongs 3' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  @shouldHavePermission('ADMINISTRATOR')
  public async run(msg: CommandoMessage, args: string) {
    if (!args) {
      const maxSongs = msg.guild.settings.get('maxSongs', MAX_SONGS);

      deleteCommandMessages(msg, this.client);

      return msg.reply(`the maximum songs a user may have in the queue at one time is ${maxSongs}.`);
    }
    if (args.toLowerCase() === 'default') {
      msg.guild.settings.remove('maxSongs');
      deleteCommandMessages(msg, this.client);

      return msg.reply(`set the maximum songs to the default (currently ${MAX_SONGS}).`);
    }

    const newLimit = parseInt(args);

    if (isNaN(newLimit) || newLimit <= 0) {
      return msg.reply('invalid number provided.');
    }

    msg.guild.settings.set('maxSongs', newLimit);
    deleteCommandMessages(msg, this.client);

    return msg.reply(`set the maximum songs to ${newLimit}.`);
  }
}