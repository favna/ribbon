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
 * @file Searches MangaCommand - Gets information about any manga from MyAnimeList  
 * **Aliases**: `cartoon`, `man`
 * @module
 * @category searches
 * @name manga
 * @example manga Yu-Gi-Oh
 * @param {string} AnyManga manga to look up
 * @returns {MessageEmbed} Information about the requested manga
 */

const maljs = require('maljs'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class MangaCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'manga',
      memberName: 'manga',
      group: 'searches',
      aliases: ['cartoon', 'man'],
      description: 'Finds manga on MyAnimeList',
      format: 'MangaName',
      examples: ['manga Pokemon'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'query',
          prompt: 'What manga do you want to find?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, args) {
    startTyping(msg);
    const manEmbed = new MessageEmbed(),
      res = await maljs.quickSearch(args.query, 'manga');

    if (res) {
      const manga = await res.manga[0].fetch();

      if (manga) {

        manEmbed
          .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
          .setTitle(manga.title)
          .setImage(manga.cover)
          .setDescription(manga.description)
          .setURL(`${manga.mal.url}${manga.path}`)
          .addField('Score', manga.score, true)
          .addField('Popularity', manga.popularity, true)
          .addField('Rank', manga.ranked, true);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(manEmbed, `${manga.mal.url}${manga.path}`);
      }
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no manga found for the input \`${args.query}\` `);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`no manga found for the input \`${args.query}\` `);
  }
};