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

import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { Snowflake } from 'awesome-djs';
import { MusicCommand, MusicQueueType } from 'RibbonTypes';

export default class ResumeSongCommand extends Command {
  private songQueue: Map<Snowflake, MusicQueueType>;

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
    this.songQueue = this.queue;
  }

  get queue () {
    if (!this.songQueue) {
      this.songQueue = (this.client.registry.resolveCommand('music:launch') as MusicCommand).queue;
    }

    return this.songQueue;
  }

  public run (msg: CommandoMessage) {
    const queue = this.queue.get(msg.guild.id);
    if (!queue) {
      return msg.reply('there isn\'t any music playing to resume, oh brilliant one.');
    }
    if (!queue.songs[0].dispatcher) {
      return msg.reply('pretty sure a song that hasn\'t actually begun playing yet could be considered "resumed".');
    }
    if (queue.songs[0].playing) {
      return msg.reply('resuming a song that isn\'t paused is a great move. Really fantastic.');
    }

    queue.songs[0].dispatcher.resume();
    queue.songs[0].playing = true;

    deleteCommandMessages(msg, this.client);

    return msg.reply('resumed the music. This party ain\'t over yet!');
  }
}
