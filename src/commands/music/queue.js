/**
 * @file Music ViewQueueCommand - Shows the current queue of songs  
 * Songs are paginated in sets of 5  
 * **Aliases**: `songs`, `song-list`, `list`, `listqueue`
 * @module
 * @category music
 * @name queue
 * @example queue 2
 * @param {StringResolvable} [Page] Page to show
 * @returns {MessageEmbed} List of queued songs with their duration and total duration of the queue
 */

const {Command, util} = require('discord.js-commando'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, Song, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class ViewQueueCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'queue',
      memberName: 'queue',
      group: 'music',
      aliases: ['songs', 'song-list', 'list', 'listqueue'],
      description: 'Lists the queued songs.',
      format: '[PageNumber]',
      examples: ['queue 2'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'page',
          prompt: 'what page would you like to view?',
          type: 'integer',
          default: 1
        }
      ]
    });
  }

  run (msg, {page}) {
    startTyping(msg);
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('there are no songs in the queue. Why not put something in my jukebox?');
    }

    const currentSong = queue.songs[0], // eslint-disable-line one-var
      currentTime = currentSong.dispatcher ? currentSong.dispatcher.streamTime / 1000 : 0,
      paginated = util.paginate(queue.songs, page, Math.floor(process.env.PAGINATED_ITEMS)),
      totalLength = queue.songs.reduce((prev, song) => prev + song.length, 0);

    msg.embed({
      color: msg.guild ? msg.guild.me.displayColor : 10610610,
      author: {
        name: `${msg.author.tag} (${msg.author.id})`,
        iconURL: msg.author.displayAvatarURL({format: 'png'})
      },
      /* eslint-disable max-len */
      description: stripIndents`
                    __**Song queue, page ${paginated.page}**__
                    ${paginated.items.map(song => `**-** ${!isNaN(song.id) ? `${song.name} (${song.lengthString})` : `[${song.name}](${`https://www.youtube.com/watch?v=${song.id}`})`} (${song.lengthString})`).join('\n')}
                    ${paginated.maxPage > 1 ? `\nUse ${msg.usage()} to view a specific page.\n` : ''}
    
                    **Now playing:** ${!isNaN(currentSong.id) ? `${currentSong.name}` : `[${currentSong.name}](${`https://www.youtube.com/watch?v=${currentSong.id}`})`}
                    ${oneLine`
                        **Progress:**
                        ${!currentSong.playing ? 'Paused: ' : ''}${Song.timeString(currentTime)} /
                        ${currentSong.lengthString}
                        (${currentSong.timeLeft(currentTime)} left)
                    `}
                    **Total queue time:** ${Song.timeString(totalLength)}
                `
      /* eslint-enable max-len */
    });
    deleteCommandMessages(msg, this.client);

    return stopTyping(msg);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('music:play').queue;
    }

    return this._queue;
  }
};