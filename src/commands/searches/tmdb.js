/**
 * @file Searches MovieCommand - Find information about a movie using TheMovieDatabase  
 * **Aliases**: `movie`
 * @module
 * @category searches
 * @name tmdb
 * @example tmdb Pokemon 2000
 * @param {StringResolvable} MovieName Name of the movie you want to find
 * @returns {MessageEmbed} Information about the fetched movie
 */

import fetch from 'node-fetch';
import moment from 'moment';
import querystring from 'querystring';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

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

  async run (msg, {name}) {
    try {
      startTyping(msg);
      const movieSearch = await fetch(`https://api.themoviedb.org/3/search/movie?${querystring.stringify({
          api_key: process.env.moviedbkey, // eslint-disable-line camelcase
          query: name 
        })}`),
        movieList = await movieSearch.json(),
        movieStats = await fetch(`https://api.themoviedb.org/3/movie/${movieList.results[0].id}?${querystring.stringify({api_key: process.env.moviedbkey})}`), // eslint-disable-line camelcase
        movie = await movieStats.json(),
        movieEmbed = new MessageEmbed();

      movieEmbed
        .setTitle(movie.title)
        .setURL(`https://www.themoviedb.org/movie/${movie.id}`)
        .setColor(msg.guild ? msg.member.displayHexColor : '#7CFC00')
        .setImage(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
        .setThumbnail(`https://image.tmdb.org/t/p/original${movie.poster_path}`)
        .setDescription(movie.overview)
        .addField('Runtime', movie.runtime ? `${movie.runtime} minutes` : 'Movie in production', true)
        .addField('User Score', movie.vote_average ? movie.vote_average : 'Movie in production', true)
        .addField('Status', movie.status, true)
        .addField('Release Date', moment(movie.release_date).format('MMMM Do YYYY'), true)
        .addField('IMDB Page', movie.imdb_id ? `[Click Here](http://www.imdb.com/title/${movie.imdb_id})` : 'none', true)
        .addField('Home Page', movie.homepage ? `[Click Here](${movie.homepage})` : 'None', true)
        .addField('Collection', movie.belongs_to_collection ? movie.belongs_to_collection.name : 'Not part of a collection', false)
        .addField('Genres', movie.genres.length ? movie.genres.map(genre => genre.name).join(', ') : 'None on TheMovieDB', false);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(movieEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no movies found for \`${name}\``);
    }
  }
};