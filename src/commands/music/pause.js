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
 * @file Music PauseSongCommand - Pauses the currently playing track  
 * You need to be in a voice channel before you can use this command  
 * **Aliases**: `shh`, `shhh`, `shhhh`, `shhhhh`, `hush`, `halt`
 * @module
 * @category music
 * @name pause
 * @returns {Message} Confirmation the music was paused
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class PauseSongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pause',
      memberName: 'pause',
      group: 'music',
      aliases: ['shh', 'shhh', 'shhhh', 'shhhhh', 'hush', 'halt'],
      description: 'Pauses the currently playing song',
      examples: ['pause'],
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

      return msg.reply('I am not playing any music right now, why not get me to start something?');
    }
    if (!queue.songs[0].dispatcher) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('I can\'t pause a song that hasn\'t even begun playing yet.');
    }
    if (!queue.songs[0].playing) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('pauseception is not possible 🤔');
    }
    queue.songs[0].dispatcher.pause();
    queue.songs[0].playing = false;

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`paused the music. Use \`${msg.guild.commandPrefix}resume\` to continue playing.`);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('music:play').queue;
    }

    return this._queue;
  }
};