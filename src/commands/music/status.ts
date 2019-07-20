/**
 * @file Music MusicStatusCommand - Gets status about the currently playing song
 *
 * **Aliases**: `song`, `playing`, `current-song`, `now-playing`
 * @module
 * @category music
 * @name status
 */

import { deleteCommandMessages, Song } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, Snowflake } from 'awesome-djs';
import { stripIndents } from 'common-tags';
import { MusicCommand, MusicQueueType } from 'RibbonTypes';

export default class MusicStatusCommand extends Command {
  private songQueue: Map<Snowflake, MusicQueueType>;

  public constructor(client: CommandoClient) {
    super(client, {
      name: 'status',
      aliases: [ 'song', 'playing', 'current-song', 'now-playing' ],
      group: 'music',
      memberName: 'status',
      description: 'Shows the current status of the music.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
    this.songQueue = this.queue;
  }

  private get queue() {
    if (!this.songQueue) {
      this.songQueue = (this.client.registry.resolveCommand('music:launch') as MusicCommand).queue;
    }

    return this.songQueue;
  }

  public async run(msg: CommandoMessage) {
    const queue = this.queue.get(msg.guild.id);
    if (!queue) return msg.say('There isn\'t any music playing right now. You should get on that.');

    const song = queue.songs[0];
    const currentTime = song.dispatcher ? song.dispatcher.streamTime / 1000 : 0;
    const songStatusEmbed = new MessageEmbed()
      .setAuthor(song.username, song.avatar)
      .setColor(msg.guild.me.displayHexColor)
      .setDescription(stripIndents`
          [${song}](${`${song.url}`})

          We are ${Song.timeString(currentTime)} into the song, and have ${song.timeLeft(currentTime)} left.
          ${!song.playing ? 'The music is paused.' : ''}
        `)
      .setImage(song.thumbnail);

    deleteCommandMessages(msg, this.client);

    return msg.embed(songStatusEmbed);
  }
}