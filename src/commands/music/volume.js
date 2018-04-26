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
 * @file Music ChangeVolumeCommand - Changes the volume of the currently playing song  
 * If you do not  give any parameter the bot will show the current volume  
 * You need to be in a voice channel before you can use this command  
 * **Aliases**: `set-volume`, `set-vol`, `vol`
 * @module
 * @category music
 * @name volume
 * @example volume 2
 * @param {number} [Volume] The new volume to set
 * @returns {Message} Confirmation of the change of volume
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class ChangeVolumeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'volume',
      memberName: 'volume',
      aliases: ['set-volume', 'set-vol', 'vol'],
      group: 'music',
      description: 'Changes the volume.',
      details: 'The volume level ranges from 0-10. You may specify "up" or "down" to modify the volume level by 2.',
      format: '[level]',
      examples: ['volume', 'volume 7', 'volume up', 'volume down'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg, args) {
    startTyping(msg);
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('there isn\'t any music playing to change the volume of. Better queue some up!');
    }
    if (!args) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`the dial is currently set to ${queue.volume}.`);
    }
    if (!queue.voiceChannel.members.has(msg.author.id)) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('you\'re not in the voice channel. You better not be trying to mess with their mojo, man.');
    }

    let volume = parseInt(args, 10);

    if (isNaN(volume)) {
      volume = args.toLowerCase();
      if (volume === 'up' || volume === '+') {
        volume = queue.volume + 2;
      } else if (volume === 'down' || volume === '-') {
        volume = queue.volume - 2;
      } else {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('invalid volume level. The dial goes from 0-10, baby.');
      }
      if (volume === 11) {
        volume = 10;
      }
    }

    volume = Math.min(Math.max(volume, 0), volume === 11 ? 11 : 10);
    queue.volume = volume;
    if (queue.songs[0].dispatcher) {
      queue.songs[0].dispatcher.setVolumeLogarithmic(queue.volume / 5);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`${volume === 11 ? 'this one goes to 11!' : `set the dial to ${volume}.`}`);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('music:play').queue;
    }

    return this._queue;
  }
};