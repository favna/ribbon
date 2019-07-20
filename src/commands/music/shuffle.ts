/**
 * @file Music ShuffleCommand - Shuffles the current queue
 *
 * Shuffles using a [modern version of the Fisher-Yates shuffle
 *     algorithm](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle#The_modern_algorithm)
 *
 * **Aliases**: `remix`, `mixtape`
 * @module
 * @category music
 * @name queue
 * @example queue 2
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, Song } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage, util } from 'awesome-commando';
import { MessageEmbed, Snowflake } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import { MusicCommand, MusicQueueType } from 'RibbonTypes';

export default class ShuffleCommand extends Command {
  private songQueue: Map<Snowflake, MusicQueueType>;

  public constructor(client: CommandoClient) {
    super(client, {
      name: 'shuffle',
      aliases: [ 'remix', 'mixtape' ],
      group: 'music',
      memberName: 'shuffle',
      description: 'Shuffles the current queue of songs',
      details: oneLine`
        Shuffles using a
        [modern version of the Fisher-Yates shuffle algorithm](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle#The_modern_algorithm)
      `,
      examples: [ 'shuffle' ],
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
    if (!queue) return msg.reply('there are no songs in the queue. Why not put something in my jukebox?');
    if (queue.songs.length <= 2) return msg.reply('cannot shuffle a queue smaller than 2 tracks. Why not queue some more tunes?');

    const currentPlaying = queue.songs[0];

    queue.songs.shift();
    queue.songs = this.shuffle(queue.songs);
    queue.songs.unshift(currentPlaying);

    const currentSong = queue.songs[0];
    const currentTime = currentSong.dispatcher ? currentSong.dispatcher.streamTime / 1000 : 0;
    const embed = new MessageEmbed();
    const paginated = util.paginate(queue.songs, 1, Math.floor(10));

    embed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
      .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({ format: 'png' }))
      .setImage(currentSong.thumbnail)
      .setDescription(stripIndents`
    __**First 10 songs in the queue**__
    ${paginated.items.map(song => `
    **-** ${song.id
    ? `[${song.name}](https://www.youtube.com/watch?v=${song.id}) (${song.lengthString})`
    : `${song.name} (${song.lengthString})`}`).join('\n')}

    ${paginated.maxPage > 1
    ? `\nUse ${msg.usage()} to view a specific page.\n`
    : ''}


    **Now playing:** ${currentSong.id
    ? `[${currentSong.name}](https://www.youtube.com/watch?v=${currentSong.id})`
    : `${currentSong.name}`}

    ${oneLine`
     **Progress:**${!currentSong.playing ? 'Paused: ' : ''}
     ${Song.timeString(currentTime)} / ${currentSong.lengthString}(${currentSong.timeLeft(currentTime)} left)`}`);

    deleteCommandMessages(msg, this.client);

    return msg.embed(embed);
  }

  private shuffle(a: Song[]) {
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));

      [ a[i], a[j] ] = [ a[j], a[i] ];
    }

    return a;
  }
}