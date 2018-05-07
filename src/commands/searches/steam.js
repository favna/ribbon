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
 * @file Searches SteamCommand - Gets information about a game using Steam  
 * **Aliases**: `valve`
 * @module
 * @category searches
 * @name steam
 * @example steam Tales of Berseria
 * @param {string} GameName The name of any game that you want to find
 * @returns {MessageEmbed} Information about the requested game
 */

const SteamAPI = require('steamapi'),
  cheerio = require('cheerio'),
  currencySymbol = require('currency-symbol-map'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class SteamCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'steam',
      memberName: 'steam',
      group: 'searches',
      aliases: ['valve'],
      description: 'Finds a game on Steam',
      format: 'GameName',
      examples: ['steam Tales of Berseria'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'game',
          prompt: 'Which game do you want to find on the steam store?',
          type: 'string',
          parse: p => p.replace(/ /gim, '+')
        }
      ]
    });
  }

  insert (str, value) {
    return str.substring(0, str.length - 2) + value + str.substring(str.length - 2);
  }

  async run (msg, {game}) {
    startTyping(msg);

    try {
      /* eslint-disable sort-vars*/
      const steam = new SteamAPI(process.env.steamkey),
        steamEmbed = new MessageEmbed(),
        steamSearch = await request.get(`http://store.steampowered.com/search/?term=${game}`),
        $ = cheerio.load(steamSearch.text),
        gameID = $('#search_result_container > div:nth-child(2) > a:nth-child(2)').attr('href')
          .split('/')[4],
        steamData = await steam.getGameDetails(gameID),
        genres = [],
        platforms = [];
      /* eslint-enable sort-vars*/

      steamData.platforms.windows ? platforms.push('Windows') : null;
      steamData.platforms.mac ? platforms.push('MacOS') : null;
      steamData.platforms.linux ? platforms.push('Linux') : null;

      for (const index in steamData.genres) {
        genres.push(steamData.genres[index].description);
      }

      steamEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(steamData.name)
        .setURL(`http://store.steampowered.com/app/${steamData.steam_appid}/`)
        .setImage(steamData.header_image)
        .setDescription(cheerio.load(steamData.short_description).text())
        .addField(steamData.price_overview
          ? `Price in ${steamData.price_overview.currency}`
          : 'Price',
        steamData.price_overview
          ? `${currencySymbol(steamData.price_overview.currency)}${this.insert(steamData.price_overview.final.toString(), ',')}`
          : 'Free',
        true)
        .addField('Release Date', steamData.release_date.date, true)
        .addField('Platforms', platforms.join(', '), true)
        .addField('Controller Support', steamData.controller_support ? steamData.controller_support : 'None', true)
        .addField('Age requirement', steamData.required_age !== 0 ? steamData.required_age : 'Everyone / Not in API', true)
        .addField('Genres', genres.join(', '), true)
        .addField('Developer(s)', steamData.developers, true)
        .addField('Publisher(s)', steamData.publishers, true)
        .addField('Steam Store Link', `http://store.steampowered.com/app/${steamData.steam_appid}/`, false);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(steamEmbed, `http://store.steampowered.com/app/${steamData.steam_appid}/`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`nothing found for \`${game}\``);
    }
  }
};