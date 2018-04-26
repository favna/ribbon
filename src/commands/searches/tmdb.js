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
 * @file Searches MovieCommand - Find information about a movie using TheMovieDatabase  
 * **Aliases**: `movie`
 * @module
 * @category searches
 * @name tmdb
 * @example tmdb Pokemon 2000
 * @param {string} MovieName Name of the movie you want to find
 * @returns {MessageEmbed} Information about the requested movie
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class MovieCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tmdb',
      memberName: 'tmdb',
      group: 'searches',
      aliases: ['movie'],
      description: 'Finds movies on TheMovieDB',
      format: 'MovieName [release_year_movie]',
      examples: ['tmdb Ocean\'s Eleven 2001'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'name',
          prompt: 'What movie do you want to find?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, args) {
    startTyping(msg);
    const embed = new MessageEmbed(),
      search = await request.get('https://api.themoviedb.org/3/search/movie')
        .query('api_key', process.env.moviedbkey)
        .query('query', args.name)
        .query('include_adult', false);

    if (search.ok && search.body.total_results > 0) {
      const details = await request.get(`https://api.themoviedb.org/3/movie/${search.body.results[0].id}`)
        .query('api_key', process.env.moviedbkey);

      if (details.ok) {
        const movie = details.body;

        embed
          .setTitle(movie.title)
          .setURL(`https://www.themoviedb.org/movie/${movie.id}`)
          .setColor(msg.guild ? msg.member.displayHexColor : '#E24141')
          .setImage(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
          .setThumbnail(`https://image.tmdb.org/t/p/original${movie.poster_path}`)
          .setDescription(movie.overview)
          .addField('Runtime', `${movie.runtime} minutes`, true)
          .addField('User Score', movie.vote_average, true)
          .addField('Status', movie.status, true)
          .addField('Release Date', moment(movie.release_date).format('MMMM Do YYYY'), true)
          .addField('Collection', movie.belongs_to_collection ? movie.belongs_to_collection.name : 'none', true)
          .addField('IMDB Page', movie.imdb_id_id ? `[Click Here](http://www.imdb.com/title/${movie.imdb_id})` : 'none', true)
          .addField('Genres', movie.genres.length ? movie.genres.map(genre => genre.name).join(', ') : 'None on TheMovieDB');

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(embed);
      }
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`failed to fetch details for \`${args.name}\``);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`no movies found for \`${args.name}\``);
  }
};