/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

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
  {deleteCommandMessages, Song, stopTyping, startTyping} = require('../../util.js');

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