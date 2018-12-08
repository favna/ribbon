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

import { oneLine } from 'common-tags';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class MaxSongsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'maxsongs',
            aliases: ['songcap', 'songmax', 'maxsong'],
            group: 'music',
            memberName: 'maxsongs',
            description: 'Shows or sets the max songs per user.',
            format: '[amount|"default"]',
            details: oneLine`
                This is the maximum number of songs a user may have in the queue.
                The default is ${process.env.MAX_SONGS}.
                Only administrators may change this setting.`,
            examples: ['maxsongs 3'],
            guildOnly: true,
            userPermissions: ['ADMINISTRATOR'],
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public run (msg: CommandoMessage, args: any) {
        startTyping(msg);
        if (!args) {
            const maxSongs = msg.guild.settings.get('maxSongs', process.env.MAX_SONGS);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`the maximum songs a user may have in the queue at one time is ${maxSongs}.`);
        } else if (args.toLowerCase() === 'default') {
            msg.guild.settings.remove('maxSongs');
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`set the maximum songs to the default (currently ${process.env.MAX_SONGS}).`);
        } else {
            const maxSongs = parseInt(args, 10);

            if (isNaN(maxSongs) || maxSongs <= 0) {
                stopTyping(msg);

                return msg.reply('invalid number provided.');
            }

            msg.guild.settings.set('maxSongs', maxSongs);
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`set the maximum songs to ${maxSongs}.`);
        }
    }
}
