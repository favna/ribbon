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
 * @file Extra xkcdCommand - Gets a random image from xkcd  
 * **Aliases**: `devjoke`, `comicjoke`
 * @module
 * @category extra
 * @name xkcd
 * @returns {MessageEmbed} Embedded image and info about it
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class xkcdCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'xkcd',
      memberName: 'xkcd',
      group: 'extra',
      aliases: ['devjoke', 'comicjoke'],
      description: 'Gets a random image from xkcd',
      examples: ['xkcd'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run (msg) {
    startTyping(msg);
    try {
      /* eslint-disable sort-vars */
      const totalImages = await request.get('https://xkcd.com/info.0.json'),
        randomNum = Math.floor(Math.random() * totalImages.body.num) + 1,
        randomImage = await request.get(`https://xkcd.com/${randomNum}/info.0.json`),
        xkcdEmbed = new MessageEmbed();
      /* eslint-enable sort-vars */

      xkcdEmbed
        .setTitle(randomImage.body.safe_title)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(randomImage.body.alt)
        .setImage(randomImage.body.img)
        .setURL(`https://xkcd.com/${randomNum}/`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(xkcdEmbed);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('woops, couldn\'t get a random xkcd image. Have a 🎀 instead!');
    }
  }
};