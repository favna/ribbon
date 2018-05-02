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
 * @file Music MaxLengthCommand - Set the maximum length (in minutes) of a video  
 * Give no argument to show current amount of maximum songs  
 * Use "default" as argument to set it back to the bot default  
 * **Aliases**: `max-duration`, `max-song-length`, `max-song-duration`
 * @module
 * @category music
 * @name maxlength
 * @example maxlength 10
 * @param {number/"default"} [MaxVideoLength] New maximum length in minutes
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class MaxLengthCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'maxlength',
      memberName: 'maxlength',
      group: 'music',
      aliases: ['max-duration', 'max-song-length', 'max-song-duration'],
      description: 'Shows or sets the max song length.',
      details: oneLine`
            This is the maximum length of a song that users may queue, in minutes.
            The default is ${process.env.MAX_LENGTH}.
            Only administrators may change this setting.`,
      format: '[minutes|"default"]',
      examples: ['maxlength 10'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, args) {
    startTyping(msg);
    if (!args) {
      const maxLength = this.client.provider.get(msg.guild.id, 'maxLength', process.env.MAX_LENGTH);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`the maximum length of a song is ${maxLength} minutes.`);
    }

    if (args.toLowerCase() === 'default') {
      this.client.provider.remove(msg.guild.id, 'maxLength');
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`set the maximum song length to the default (currently ${process.env.MAX_LENGTH} minutes).`);
    }

    const maxLength = parseInt(args, 10);

    if (isNaN(maxLength) || maxLength <= 0) {
      stopTyping(msg);

      return msg.reply('invalid number provided.');
    }

    this.client.provider.set(msg.guild.id, 'maxLength', maxLength);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`set the maximum song length to ${maxLength} minutes.`);
  }
};