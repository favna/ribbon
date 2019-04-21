/**
 * @file Music DefaultVolumeCommand - Sets the server's default volume
 *
 * **Aliases**: `defvol`
 * @module
 * @category music
 * @name defaultvolume
 * @example defaultvolume 2
 * @param {number/"show"} [VolumeToSet] The volume to set or use "show" to show current default volume
 */

import { DEFAULT_VOLUME } from '@components/Constants';
import { deleteCommandMessages, shouldHavePermission, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';

export default class DefaultVolumeCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'defaultvolume',
            aliases: ['defvol'],
            group: 'music',
            memberName: 'defaultvolume',
            description: 'Shows or sets the default volume level',
            format: 'VolumeToSet',
            examples: ['defaultvolume 2'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'volume',
                    prompt: 'What is the default volume I should set? (\'default\' to reset)',
                    type: 'string',
                    default: 'show',
                }
            ],
        });
    }

    @shouldHavePermission('ADMINISTRATOR')
    public run (msg: CommandoMessage, { volume }: { volume: string }) {
        startTyping(msg);
        if (volume === 'show') {
            const defaultVolume = msg.guild.settings.get('defaultVolume', DEFAULT_VOLUME);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`the default volume level is ${defaultVolume}.`);
        }

        if (volume === 'default') {
            msg.guild.settings.remove('defaultVolume');
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`set the default volume level to Ribbon's default (currently ${DEFAULT_VOLUME}).`);
        }

        const newVolume = parseInt(volume, 10);

        if (isNaN(newVolume) || newVolume <= 0 || newVolume > 10) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply('invalid number provided. It must be in the range of 0-10.');
        }

        msg.guild.settings.set('defaultVolume', newVolume);
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply(`set the default volume level to ${newVolume}.`);
    }
}
