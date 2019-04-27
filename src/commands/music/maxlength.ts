/**
 * @file Music MaxLengthCommand - Set the maximum length (in minutes) of a video
 *
 * Give no argument to show current amount of maximum songs. Use "default" as argument to set it back to Ribbon's
 *     default
 *
 * **Aliases**: `max-duration`, `max-song-length`, `max-song-duration`
 * @module
 * @category music
 * @name maxlength
 * @example maxlength 10
 * @param {number | "default"} [MaxVideoLength] New maximum length in minutes
 */

import { MAX_LENGTH } from '@components/Constants';
import { deleteCommandMessages, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { oneLine } from 'common-tags';

export default class MaxLengthCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'maxlength',
            aliases: ['max-duration', 'max-song-length', 'max-song-duration'],
            group: 'music',
            memberName: 'maxlength',
            description: 'Shows or sets the max song length.',
            format: '[minutes|"default"]',
            details: oneLine`
                This is the maximum length of a song that users may queue, in minutes.
                The default is ${MAX_LENGTH}.
                Only administrators may change this setting.`,
            examples: ['maxlength 10'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    @shouldHavePermission('ADMINISTRATOR')
    public run (msg: CommandoMessage, args: any) {
        if (!args) {
            const maxLength = msg.guild.settings.get('maxLength', MAX_LENGTH);

            deleteCommandMessages(msg, this.client);

            return msg.reply(`the maximum length of a song is ${maxLength} minutes.`);
        }
        if (args.toLowerCase() === 'default') {
            msg.guild.settings.remove('maxLength');
            deleteCommandMessages(msg, this.client);

            return msg.reply(`set the maximum song length to the default (currently ${MAX_LENGTH} minutes).`);
        }

        const newLength = parseInt(args, 10);

        if (isNaN(newLength) || newLength <= 0) {
            return msg.reply('invalid number provided.');
        }

        msg.guild.settings.set('maxLength', newLength);
        deleteCommandMessages(msg, this.client);

        return msg.reply(`set the maximum song length to ${newLength} minutes.`);

    }
}
