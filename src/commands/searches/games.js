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
 * @file Searches GamesCommand - Gets information about a game using IndieGamesDoneBad (IGDB)  
 * **Aliases**: `game`, `moby`, `igdb`
 * @module
 * @category searches
 * @name games
 * @example games Tales of Berseria
 * @param {string} GameName The name of any game that you want to find
 * @returns {MessageEmbed} Information about the requested game
 */

const igdbapi = require('igdb-api-node').default,
  moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, roundNumber, stopTyping, startTyping} = require('../../util.js');

module.exports = class GamesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'games',
      memberName: 'games',
      group: 'searches',
      aliases: ['game', 'moby', 'igdb'],
      description: 'Finds info on a game on IGDB (IndieGamesDoneBad)',
      format: 'GameName',
      examples: ['games {gameName}', 'games Tales of Berseria'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'game',
          prompt: 'Which game do you want to look up on IGDB?',
          type: 'string',
          label: 'Game to look up'
        }
      ]

    });
  }

  extractNames (arr) {
    let res = '';

    for (let i = 0; i < arr.length; i += 1) {
      if (i !== arr.length - 1) {
        res += `${arr[i].name}, `;
      } else {
        res += `${arr[i].name}`;
      }
    }

    return res;
  }

  async run (msg, args) {
    startTyping(msg);
    try {
      /* eslint-disable sort-vars*/
      const gameEmbed = new MessageEmbed(),
        igdb = igdbapi(process.env.igdbkey),
        gameInfo = await igdb.games({
          search: args.game,
          fields: ['name', 'url', 'summary', 'rating', 'developers', 'genres', 'release_dates', 'platforms', 'cover', 'esrb', 'pegi'],
          limit: 1,
          offset: 0
        }),
        coverImg = await gameInfo.body[0].cover.url.includes('http') ? gameInfo.body[0].cover.url : `https:${gameInfo.body[0].cover.url}`,
        developerInfo = await igdb.companies({
          ids: gameInfo.body[0].developers,
          fields: ['name']
        }),
        genreInfo = await igdb.genres({
          ids: gameInfo.body[0].genres,
          fields: ['name']
        }),
        platformInfo = await igdb.platforms({
          ids: gameInfo.body[0].platforms,
          fields: ['name']
        }),
        releaseDate = moment(gameInfo.body[0].release_dates[0].date).format('MMMM Do YYYY');
      /* eslint-enable sort-vars*/

      gameEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(gameInfo.body[0].name)
        .setURL(gameInfo.body[0].url)
        .setThumbnail(coverImg)
        .addField('User Score', roundNumber(gameInfo.body[0].rating, 1), true)
        .addField(`${gameInfo.body[0].pegi ? 'PEGI' : 'ESRB'} rating`, gameInfo.body[0].pegi ? gameInfo.body[0].pegi.rating : gameInfo.body[0].esrb.rating, true)
        .addField('Release Date', releaseDate, true)
        .addField('Genres', this.extractNames(genreInfo.body), true)
        .addField('Developer', developerInfo.body[0].name, true)
        .addField('Platforms', this.extractNames(platformInfo.body), true)
        .setDescription(gameInfo.body[0].summary);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(gameEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`nothing found for \`${args.game}\``);
    }
  }
};