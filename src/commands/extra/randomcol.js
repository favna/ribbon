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
 * @file Extra RandomCol - Generates a random color  
 * Providing a color hex will display that color, providing none will generate a random one  
 * **Aliases**: `randhex`, `rhex`, `randomcolor`, `randcol`, `randomhex`
 * @module
 * @category extra
 * @name randomcol
 * @example randomcol  
 * -OR-  
 * randomcol #990000  
 * -OR-  
 * randomcol 36B56e
 * @param {string} [hex] Optional: Color hex to display
 * @returns {MessageEmbed} Color of embed matches generated color
 */

const imgur = require('imgur'),
  {Canvas} = require('canvas-constructor'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class RandomColCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'randomcol',
      memberName: 'randomcol',
      group: 'extra',
      aliases: ['randhex', 'rhex', 'randomcolor', 'randcol', 'randomhex'],
      description: 'Generate a random color',
      format: '[hex color]',
      examples: ['randomcol', 'randomcol #990000', 'randomcol 36B56e'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'col',
          prompt: 'What color do you want to preview?',
          type: 'string',
          default: 'random',
          validate: (col) => {
            if (/^#{0,1}(?:[0-9a-fA-F]{6})$/i.test(col) || col === 'random') {
              return true;
            }

            return 'Respond with a hex formatted color of 6 characters, example: `#990000` or `36B56e`';
          },
          parse: (col) => {
            if (/^#{0}(?:[0-9a-fA-F]{6})$/i.test(col)) {
              return `#${col}`;
            }

            return col;
          }
        }
      ]
    });
  }

  hextodec (color) {
    return parseInt(color.replace('#', ''), 16);
  }

  hextorgb (color) {
    const result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d])*$/i).exec(color);

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  async run (msg, args) {
    startTyping(msg);
    const embed = new MessageEmbed(),
      hex = args.col !== 'random' ? args.col : `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      canv = new Canvas(80, 60) // eslint-disable-line sort-vars
        .setColor(hex)
        .addRect(0, 0, 100, 60)
        .toBuffer();

    if (canv.toString('base64')) {
      const upload = await imgur.uploadBase64(canv.toString('base64'));

      if (upload) {
        embed
          .setColor(hex)
          .setThumbnail(upload.data.link)
          .setDescription(stripIndents`**hex**: ${hex}
				**dec**: ${this.hextodec(hex)}
				**rgb**: rgb(${this.hextorgb(hex).r}, ${this.hextorgb(hex).g}, ${this.hextorgb(hex).b})`);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(embed);
      }
      stopTyping(msg);

      return msg.reply('an error occurred uploading the canvas to imgur.');
    }
    stopTyping(msg);

    return msg.reply('an error occurred getting a base64 for the canvas.');
  }
};