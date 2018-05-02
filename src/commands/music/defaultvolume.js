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
 * @file Music DefaultVolumeCommand - Sets the server's default volume  
 * **Aliases**: `defvol`
 * @module
 * @category music
 * @name defaultvolume
 * @example defaultvolume 2
 * @param {number/"show"} VolumeToSet The volume to set or use "show" to show current default volume
 * @returns {Message} Confirmation the setting was stored 
 */

const {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class DefaultVolumeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'defaultvolume',
      memberName: 'defaultvolume',
      group: 'music',
      aliases: ['defvol'],
      description: 'Shows or sets the default volume level',
      format: 'VolumeToSet',
      examples: ['defaultvolume 2'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'volume',
          prompt: 'What is the default volume I should set? (\'default\' to reset)',
          type: 'string',
          default: 'show'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }


  run (msg, args) {
    startTyping(msg);
    if (args.volume === 'show') {
      const defaultVolume = this.client.provider.get(msg.guild.id, 'defaultVolume', process.env.DEFAULT_VOLUME);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`the default volume level is ${defaultVolume}.`);
    }

    if (args.volume === 'default') {
      this.client.provider.remove(msg.guild.id, 'defaultVolume');
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`set the default volume level to the bot's default (currently ${process.env.DEFAULT_VOLUME}).`);
    }

    const defaultVolume = parseInt(args.volume, 10);

    if (isNaN(defaultVolume) || defaultVolume <= 0 || defaultVolume > 10) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('invalid number provided. It must be in the range of 0-10.');
    }

    this.client.provider.set(msg.guild.id, 'defaultVolume', defaultVolume);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`set the default volume level to ${defaultVolume}.`);

  }
};