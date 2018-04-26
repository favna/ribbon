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
 * @file Music ResumeSongCommand - Resumes the song after pausing it  
 * You need to be in a voice channel before you can use this command  
 * **Aliases**: `go`, `continue`, `ale`, `loss`, `res`
 * @module
 * @category music
 * @name resume
 * @returns {Message} Confirmation the song is resumed
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class ResumeSongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'resume',
      memberName: 'resume',
      group: 'music',
      aliases: ['go', 'continue', 'ale', 'loss', 'res'],
      description: 'Resumes the currently playing song.',
      examples: ['resume'],
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

      return msg.reply('there isn\'t any music playing to resume, oh brilliant one.');
    }
    if (!queue.songs[0].dispatcher) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('pretty sure a song that hasn\'t actually begun playing yet could be considered "resumed".');
    }
    if (queue.songs[0].playing) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('resuming a song that isn\'t paused is a great move. Really fantastic.');
    }
    queue.songs[0].dispatcher.resume();
    queue.songs[0].playing = true;

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('resumed the music. This party ain\'t over yet!');
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('music:play').queue;
    }

    return this._queue;
  }
};