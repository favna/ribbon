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
 * @file Searches TVCommand - Find information about a TV series using TheMovieDatabase  
 * **Aliases**: `tv`, `show`, `serie`, `series`
 * @module
 * @category searches
 * @name tvdb
 * @example tvdb Pokemon
 * @param {StringResolvable} SeriesName Name of the TV serie you want to find
 * @returns {MessageEmbed} Information about the requested TV serie
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, roundNumber, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TVCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tvdb',
      memberName: 'tvdb',
      group: 'searches',
      aliases: ['tv'],
      description: 'Finds TV shows on TheMovieDB',
      format: 'MovieName [release_year_movie]',
      examples: ['tvdb Pokemon'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'name',
          prompt: 'What TV serie do you want to find?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {name}) {
    try {
      startTyping(msg);
      const showEmbed = new MessageEmbed(),
        showSearch = await request.get('https://api.themoviedb.org/3/search/tv')
          .query('api_key', process.env.moviedbkey)
          .query('query', name),
        showStats = await request.get(`https://api.themoviedb.org/3/tv/${showSearch.body.results[0].id}`)
          .query('api_key', process.env.moviedbkey);

      showEmbed
        .setTitle(showStats.body.name)
        .setURL(`https://www.themoviedb.org/tv/${showStats.body.id}`)
        .setColor(msg.guild ? msg.member.displayHexColor : '#7CFC00')
        .setImage(`https://image.tmdb.org/t/p/original${showStats.body.backdrop_path}`)
        .setThumbnail(`https://image.tmdb.org/t/p/original${showStats.body.poster_path}`)
        .setDescription(showStats.body.overview)
        .addField('Episode Runtime', `${showStats.body.episode_run_time} minutes`, true)
        .addField('Popularity', `${roundNumber(showStats.body.popularity, 2)}%`, true)
        .addField('Status', showStats.body.status, true)
        .addField('First air Date', moment(showStats.body.first_air_date).format('MMMM Do YYYY'), true)
        .addField('Genres', showStats.body.genres.length ? showStats.body.genres.map(genre => genre.name).join(', ') : 'None on TheMovieDB');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(showEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no shows found for \`${name}\``);
    }
  }
};