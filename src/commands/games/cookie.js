/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 biscuit
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
 * @file Custom CookieCommand - Steal someone's 🍪 gnanahahahaha
 * **Aliases**: `.biscuit`, `biscuit`
 * @module
 * @category custom
 * @name biscuit
 * @returns {MessageEmbed} A MessageEmbed with a cookie gif
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class CookieCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'cookie',
      memberName: 'cookie',
      group: 'games',
      aliases: ['biscuit'],
      description: 'Steal someone\'s 🍪 gnanahahahaha',
      guildOnly: false,
      patterns: [/^\.(?:biscuit)$/i],
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Whose cookie to steal?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  fetchImage () {
    const images = [
        'https://favna.xyz/images/ribbonhost/cookie/cookie01.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie02.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie03.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie04.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie05.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie06.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie07.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie08.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie09.gif'
      ],
      curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

    return images[curImage];
  }

  run (msg, {member}) {
    if (msg.patternMatches) {
      if (msg.guild.id !== '373826006651240450' && msg.guild.commandPrefix !== '.') {
        return null;
      }
      if (!msg.guild.settings.get('regexmatches', false)) {
        return null;
      }
    }

    startTyping(msg);
    const cookieEmbed = new MessageEmbed();

    cookieEmbed.setImage(this.fetchImage())
      .setColor(msg.guild ? msg.guild.me.displayColor : '#7CFC00');
    member ? cookieEmbed.setDescription(`Gnanahahahaha eating your cookie <@${member.id}>`) : cookieEmbed.setDescription('You won\'t steal my cookie!!');

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(cookieEmbed);
  }
};