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
 * @file nsfw PornGifsCommand - Gets a NSFW gif and webm from pornhub  
 * Can only be used in NSFW marked channels!  
 * **Aliases**: `nsfwgifs`
 * @module
 * @category nsfw
 * @name porngifs
 * @example porngifs babe
 * @param {string} Query Something you want to find
 * @returns {MessageEmbed} Webm link and embeds gif
 */

const Pornsearch = require('pornsearch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class PornGifsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'porngifs',
      memberName: 'porngifs',
      group: 'nsfw',
      aliases: ['nsfwgifs'],
      description: 'Search porn gifs',
      format: 'NSFWToLookUp',
      examples: ['porngifs babe'],
      guildOnly: false,
      nsfw: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'porn',
          prompt: 'What pornography do you want to find?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, args) {
    startTyping(msg);
    const search = new Pornsearch(args.porn),
      gifs = await search.gifs(); // eslint-disable-line sort-vars

    if (gifs) {
      const pornEmbed = new MessageEmbed(),
        random = Math.floor(Math.random() * gifs.length);

      pornEmbed
        .setURL(gifs[random].url)
        .setTitle(gifs[random].title)
        .setImage(`${gifs[random].url}`)
        .setColor('#FFB6C1')
        .addField('Gif webm', `[Click Here](${gifs[random].webm})`, true);
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(pornEmbed, gifs[random].webm);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`nothing found for \`${args.porn}\``);
  }
};