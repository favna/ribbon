/**
 * @file Music ChangeVolumeCommand - Changes the volume of the currently playing song
 *
 * If you do not give any parameter, Ribbon will show the current volume.
 * You need to be in a voice channel before you can use this command
 *
 * **Aliases**: `set-volume`, `set-vol`, `vol`
 * @module
 * @category music
 * @name volume
 * @example volume 2
 * @param {number} [Volume] The new volume to set
 */

import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, IMusicCommand, startTyping, stopTyping } from '../../components';

export default class ChangeVolumeCommand extends Command {
    private songQueue: any;

    constructor (client: CommandoClient) {
        super(client, {
            name: 'volume',
            aliases: ['set-volume', 'set-vol', 'vol'],
            group: 'music',
            memberName: 'volume',
            description: 'Changes the volume.',
            format: '[level]',
            details: 'The volume level ranges from 0-10. You may specify "up" or "down" to modify the volume level by 2.',
            examples: ['volume', 'volume 7', 'volume up', 'volume down'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'volume',
                    prompt: 'What volume should I set?',
                    type: 'integer',
                    max: 11,
                    min: 0,
                    default: -1,
                }
            ],
        });
    }

    get queue () {
        if (!this.songQueue) {
            this.songQueue = (this.client.registry.resolveCommand('music:play') as IMusicCommand).queue;
        }

        return this.songQueue;
    }

    public run (msg: CommandoMessage, { volume }: { volume: number }) {
        startTyping(msg);
        const queue = this.queue.get(msg.guild.id);

        if (!queue) return msg.reply('there isn\'t any music playing to change the volume of. Better queue some up!');
        if (volume < 0) return msg.reply(`the dial is currently set to ${queue.volume}.`);
        if (!queue.voiceChannel.members.has(msg.author.id)) {
            return msg.reply('you\'re not in the voice channel. You better not be trying to mess with their mojo, man.');
        }

        queue.volume = volume;
        if (queue.songs[0].dispatcher) queue.songs[0].dispatcher.setVolumeLogarithmic(queue.volume / 5);
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply(`${volume === 11 ? 'this one goes to 11!' : `set the dial to ${volume}.`}`);
    }
}
