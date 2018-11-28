/**
 * @file Music ViewQueueCommand - Shows the current queue of songs  
 * Songs are paginated in sets of 5  
 * **Aliases**: `songs`, `song-list`, `list`, `listqueue`
 * @module
 * @category music
 * @name queue
 * @example queue 2
 * @param {StringResolvable} [Page] Page to show
 */

import { oneLine, stripIndents } from 'common-tags';
import { Command, CommandoClient, CommandoMessage, util } from 'discord.js-commando';
import { deleteCommandMessages, Song, startTyping, stopTyping } from '../../components/util';

export default class ViewQueueCommand extends Command {
  private songQueue: any;
  constructor (client: CommandoClient) {
    super(client, {
      name: 'queue',
      aliases: [ 'songs', 'song-list', 'list', 'listqueue' ],
      group: 'music',
      memberName: 'queue',
      description: 'Lists the queued songs.',
      format: '[PageNumber]',
      examples: [ 'queue 2' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'page',
          prompt: 'what page would you like to view?',
          type: 'integer',
          default: 1,
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { page }: {page: number}) {
    startTyping(msg);
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('there are no songs in the queue. Why not put something in my jukebox?');
    }

    const currentSong = queue.songs[0];
    const currentTime = currentSong.dispatcher ? currentSong.dispatcher.streamTime / 1000 : 0;
    const paginated = util.paginate(queue.songs, page, Math.floor(Number(process.env.PAGINATED_ITEMS)));
    const totalLength = queue.songs.reduce((prev: any, song: any) => prev + song.length, 0);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed({
      author: {
        name: `${msg.author.tag} (${msg.author.id})`,
        iconURL: msg.author.displayAvatarURL({ format: 'png' }),
      },
      color: msg.guild ? msg.guild.me.displayColor : 10610610,
      /* tslint:disable:max-line-length */
      description: stripIndents`
          __**Song queue, page ${paginated.page}**__
          ${paginated.items.map((song: Song) => `**-** ${!isNaN(song.id) ? `${song.name} (${song.lengthString})` : `[${song.name}](${`https://www.youtube.com/watch?v=${song.id}`})`} (${song.lengthString})`).join('\n')}
          ${paginated.maxPage > 1 ? `\nUse ${msg.usage()} to view a specific page.\n` : ''}

          **Now playing:** ${!isNaN(currentSong.id) ? `${currentSong.name}` : `[${currentSong.name}](${`https://www.youtube.com/watch?v=${currentSong.id}`})`}
          ${oneLine`
              **Progress:**
              ${!currentSong.playing ? 'Paused: ' : ''}${Song.timeString(currentTime)} /
              ${currentSong.lengthString}
              (${currentSong.timeLeft(currentTime)} left)
          `}
          **Total queue time:** ${Song.timeString(totalLength)}
      `,
    /* tslint:enable:max-line-length */
    });
  }

  get queue () {
    if (!this.songQueue) {
      // @ts-ignore
      this.songQueue = this.client.registry.resolveCommand('music:play').queue;
    }

    return this.songQueue;
  }
}