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
 * @file Games ShipCommand - Ship 2 players  
 * **Aliases**: `love`, `marry`, `engage`
 * @module
 * @category games
 * @name ship
 * @example ship Biscuit Rei
 * @param {string} ShipMemberOne The first member to ship
 * @param {string} ShipMemberTwo The second member to ship
 * @returns {MessageEmbed} Name of the ship
 */

/* eslint-disable no-unused-vars*/ 
const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class ShipCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ship',
      memberName: 'ship',
      group: 'games',
      aliases: ['love', 'marry', 'engage'],
      description: 'Ship 2 players',
      format: 'ShipMemberOne ShipMemberTwo',
      examples: ['ship Biscuit Rei'],
      guildOnly: false,
      ownerOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'shipone',
          prompt: 'Who to ship?',
          type: 'member'
        },
        {
          key: 'shiptwo',
          prompt: 'And who to ship them with?',
          type: 'member'
        }
      ]
    });
  }

  run (msg, {shipone, shiptwo}) {

    /**
     * @todo implement shipping command
     * @description This will output both avatars with a heart in between as well as their ship name, using JIMP
     */

    startTyping(msg);
    stopTyping(msg);

    return msg.say('Sorry that command is still in development');
  }
};