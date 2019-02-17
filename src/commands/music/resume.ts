/**
 * @file Music ResumeSongCommand - Resumes the song after pausing it
 *
 * You need to be in a voice channel before you can use this command
 *
 * **Aliases**: `go`, `continue`, `ale`, `loss`, `res`
 * @module
 * @category music
 * @name resume
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { deleteCommandMessages, IMusicCommand, MusicQueueType, startTyping, stopTyping } from '../../components';

export default class ResumeSongCommand extends Command {
    private songQueue: Map<string, MusicQueueType>;

    constructor (client: CommandoClient) {
        super(client, {
            name: 'resume',
            aliases: ['go', 'continue', 'ale', 'loss', 'res'],
            group: 'music',
            memberName: 'resume',
            description: 'Resumes the currently playing song.',
            examples: ['resume'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    get queue () {
        if (!this.songQueue) {
            this.songQueue = (this.client.registry.resolveCommand('music:play') as IMusicCommand).queue;
        }

        return this.songQueue;
    }

    public run (msg: CommandoMessage) {
        const queue = this.queue.get(msg.guild.id);
        if (!queue) return msg.reply('there isn\'t any music playing to resume, oh brilliant one.');
        if (!queue.songs[0].dispatcher) return msg.reply('pretty sure a song that hasn\'t actually begun playing yet could be considered "resumed".');
        if (queue.songs[0].playing) return msg.reply('resuming a song that isn\'t paused is a great move. Really fantastic.');

        startTyping(msg);
        queue.songs[0].dispatcher.resume();
        queue.songs[0].playing = true;

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('resumed the music. This party ain\'t over yet!');
    }
}
