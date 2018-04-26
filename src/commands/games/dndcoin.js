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
 * @file Games DndCCommand - Flips a coin  
 * **Aliases**: `coinflip`, `dndc`, `dcoin`
 * @module
 * @category games
 * @name dndc
 * @returns {MessageEmbed} Side the coin landed on
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {deleteCommandMessages, roundNumber, stopTyping, startTyping} = require('../../util.js');

module.exports = class DndCCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dndcoin',
      memberName: 'dndcoin',
      group: 'games',
      aliases: ['coinflip', 'dndc', 'dcoin'],
      description: 'Flips a coin',
      examples: ['coin'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg) {
    startTyping(msg);
    const coinEmbed = new MessageEmbed(),
      flip = roundNumber(Math.random());

    coinEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setImage(flip === 1 ? 'https://favna.xyz/images/ribbonhost/dndheads.png' : 'https://favna.xyz/images/ribbonhost/dndtails.png')
      .setTitle(`Flipped ${flip === 1 ? 'heads' : 'tails'}`);

    deleteCommandMessages(msg, this.client);
    msg.embed(coinEmbed);

    return stopTyping(msg);
  }
};