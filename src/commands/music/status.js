/**
 * @file Music MusicStatusCommand - Gets status about the currently playing song  
 * **Aliases**: `song`, `playing`, `current-song`, `now-playing`
 * @module
 * @category music
 * @name status
 * @returns {MessageEmbed} Title, URL of and progress into the song
 */

const {Command} = require('discord.js-commando'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, Song, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class MusicStatusCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'status',
      memberName: 'status',
      group: 'music',
      aliases: ['song', 'playing', 'current-song', 'now-playing'],
      description: 'Shows the current status of the music.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg) {
    startTyping(msg);
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.say('There isn\'t any music playing right now. You should get on that.');
    }
    const song = queue.songs[0], // eslint-disable-line one-var
      currentTime = song.dispatcher ? song.dispatcher.streamTime / 1000 : 0, // eslint-disable-line sort-vars
      embed = { // eslint-disable-line sort-vars
        color: 3447003,
        author: {
          name: `${song.username}`,
          iconURL: song.avatar
        },
        description: stripIndents`
				[${song}](${`${song.url}`})

				We are ${Song.timeString(currentTime)} into the song, and have ${song.timeLeft(currentTime)} left.
				${!song.playing ? 'The music is paused.' : ''}
			`,
        image: {url: song.thumbnail}
      };

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(embed);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('music:play').queue;
    }

    return this._queue;
  }
};