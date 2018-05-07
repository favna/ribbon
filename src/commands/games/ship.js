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
 * @file Games ShipCommand - Ship 2 members  
 * Leaving 1 or both parameters out will have the bot pick 1 or 2 random members  
 * **Aliases**: `love`, `marry`, `engage`
 * @module
 * @category games
 * @name ship
 * @example ship Biscuit Rei
 * @param {string} [ShipMemberOne] The first member to ship
 * @param {string} [ShipMemberTwo] The second member to ship
 * @returns {MessageEmbed} Name of the ship
 */

/* eslint-disable no-unused-vars*/
const Jimp = require('jimp'),
  imgur = require('imgur'),
  {promisify} = require('util'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, roundNumber, stopTyping, startTyping} = require('../../util.js');

module.exports = class ShipCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ship',
      memberName: 'ship',
      group: 'games',
      aliases: ['love', 'marry', 'engage'],
      description: 'Ship 2 members',
      details: 'Leaving 1 or both parameters out will have the bot pick 1 or 2 random members',
      format: 'ShipMemberOne ShipMemberTwo',
      examples: ['ship Biscuit Rei'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'romeo',
          prompt: 'Who to ship?',
          type: 'member',
          default: 'random'
        },
        {
          key: 'juliet',
          prompt: 'And who to ship them with?',
          type: 'member',
          default: 'random'
        }
      ]
    });
  }

  async run (msg, {romeo, juliet}) {
    startTyping(msg);
    romeo = romeo !== 'random' ? romeo.user : msg.guild.members.random().user;
    juliet = juliet !== 'random' ? juliet.user : msg.guild.members.random().user;
    Jimp.prototype.getBase64Async = promisify(Jimp.prototype.getBase64);

    const avaOne = await Jimp.read(romeo.displayAvatarURL({format: 'png'})),
      avaTwo = await Jimp.read(juliet.displayAvatarURL({format: 'png'})),
      boat = new MessageEmbed(),
      canvas = await Jimp.read('https://favna.xyz/images/ribbonhost/shipcanvas.png'),
      heart = await Jimp.read('https://favna.xyz/images/ribbonhost/heart.png');

    avaOne.resize(128, Jimp.AUTO);
    avaTwo.resize(128, Jimp.AUTO);

    canvas.blit(avaOne, 0, 0);
    canvas.blit(avaTwo, 256, 0);
    canvas.blit(heart, 160, 32);

    const base64 = await canvas.getBase64Async(Jimp.MIME_PNG), // eslint-disable-line one-var
      upload = await imgur.uploadBase64(base64.slice(base64.indexOf(',') + 1));

    boat
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setTitle(`Shipping ${romeo.username} and ${juliet.username}`)
      .setDescription(`I call it... ${romeo.username.substring(0, roundNumber(romeo.username.length / 2))}${juliet.username.substring(roundNumber(juliet.username.length / 2))}! 😘`)
      .setImage(upload.data.link);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(boat);
  }
};