/**
 * @file Searches TVCommand - Find information about a TV series using TheMovieDatabase  
 * **Aliases**: `tv`, `show`, `serie`, `series`
 * @module
 * @category searches
 * @name tvdb
 * @example tvdb Pokemon
 * @param {StringResolvable} SeriesName Name of the TV serie you want to find
 * @returns {MessageEmbed} Information about the fetched TV serie
 */

import fetch from 'node-fetch';
import moment from 'moment';
import querystring from 'querystring';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {deleteCommandMessages, roundNumber, stopTyping, startTyping} from '../../components/util.js';

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
      const movieSearch = await fetch(`https://api.themoviedb.org/3/search/tv?${querystring.stringify({
          api_key: process.env.moviedbkey, // eslint-disable-line camelcase
          query: name
        })}`),
        showList = await movieSearch.json(),
        showStats = await fetch(`https://api.themoviedb.org/3/tv/${showList.results[0].id}?${querystring.stringify({api_key: process.env.moviedbkey})}`), // eslint-disable-line camelcase
        show = await showStats.json(),
        showEmbed = new MessageEmbed();

      showEmbed
        .setTitle(show.name)
        .setURL(`https://www.themoviedb.org/tv/${show.id}`)
        .setColor(msg.guild ? msg.member.displayHexColor : '#7CFC00')
        .setImage(`https://image.tmdb.org/t/p/original${show.backdrop_path}`)
        .setThumbnail(`https://image.tmdb.org/t/p/original${show.poster_path}`)
        .setDescription(show.overview)
        .addField('Episode Runtime', `${show.episode_run_time} minutes`, true)
        .addField('Popularity', `${roundNumber(show.popularity, 2)}%`, true)
        .addField('Status', show.status, true)
        .addField('First air Date', moment(show.first_air_date).format('MMMM Do YYYY'), true)
        .addField('Genres', show.genres.length ? show.genres.map(genre => genre.name).join(', ') : 'None on TheMovieDB');

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