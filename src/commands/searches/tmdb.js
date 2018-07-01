/**
 * @file Searches MovieCommand - Find information about a movie using TheMovieDatabase  
 * **Aliases**: `movie`
 * @module
 * @category searches
 * @name tmdb
 * @example tmdb Pokemon 2000
 * @param {StringResolvable} MovieName Name of the movie you want to find
 * @returns {MessageEmbed} Information about the requested movie
 */

const moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

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
      const movieEmbed = new MessageEmbed(),
        movieSearch = await request.get('https://api.themoviedb.org/3/search/movie')
          .query('api_key', process.env.moviedbkey)
          .query('query', name)
          .query('include_adult', false),
        movieStats = await request.get(`https://api.themoviedb.org/3/movie/${movieSearch.body.results[0].id}`)
          .query('api_key', process.env.moviedbkey),
        hit = movieStats.body; // eslint-disable-line sort-vars

      movieEmbed
        .setTitle(hit.title)
        .setURL(`https://www.themoviedb.org/movie/${hit.id}`)
        .setColor(msg.guild ? msg.member.displayHexColor : '#7CFC00')
        .setImage(`https://image.tmdb.org/t/p/original${hit.backdrop_path}`)
        .setThumbnail(`https://image.tmdb.org/t/p/original${hit.poster_path}`)
        .setDescription(hit.overview)
        .addField('Runtime', hit.runtime ? `${hit.runtime} minutes` : 'Movie in production', true)
        .addField('User Score', hit.vote_average ? hit.vote_average : 'Movie in production', true)
        .addField('Status', hit.status, true)
        .addField('Release Date', moment(hit.release_date).format('MMMM Do YYYY'), true)
        .addField('IMDB Page', hit.imdb_id ? `[Click Here](http://www.imdb.com/title/${hit.imdb_id})` : 'none', true)
        .addField('Home Page', hit.homepage ? `[Click Here](${hit.homepage})` : 'None', true)
        .addField('Collection', hit.belongs_to_collection ? hit.belongs_to_collection.name : 'Not part of a collection', false)
        .addField('Genres', hit.genres.length ? hit.genres.map(genre => genre.name).join(', ') : 'None on TheMovieDB', false);

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