/**
 * @file Searches MovieCommand - Find information about a movie using TheMovieDatabase
 *
 * **Aliases**: `movie`
 * @module
 * @category searches
 * @name tmdb
 * @example tmdb Pokemon 2000
 * @param {string} MovieName Name of the movie you want to find
 */

import { CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter } from '@components/Utils';
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, User } from 'awesome-djs';
import moment from 'moment';
import fetch from 'node-fetch';
import { MovieGenreType, TMDBMovie, TMDBMovieList } from 'RibbonTypes';

type MovieArgs = {
  name: string;
  hasManageMessages: boolean;
  position: number;
};

export default class MovieCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'tmdb',
      aliases: [ 'movie' ],
      group: 'searches',
      memberName: 'tmdb',
      description: 'Finds movies on TheMovieDB',
      format: 'MovieName [release_year_movie]',
      examples: [ 'tmdb Ocean\'s Eleven 2001' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'name',
          prompt: 'What movie do you want to find?',
          type: 'string',
        }
      ],
    });
  }

  @clientHasManageMessages()
  public async run(msg: CommandoMessage, { name, hasManageMessages, position = 0 }: MovieArgs) {
    try {
      const movieSearch = await fetch(`https://api.themoviedb.org/3/search/movie?${stringify({
        api_key: process.env.MOVIEDB_API_KEY!,
        query: name,
      })}`);
      const color = msg.guild ? msg.member.displayHexColor : DEFAULT_EMBED_COLOR;
      const movieList: TMDBMovieList = await movieSearch.json();

      let currentMovie = movieList.results[position].id;
      let movie = await this.fetchAllData(currentMovie);
      let movieEmbed = this.prepMessage(
        color, movie, movieList.total_results, position, hasManageMessages
      );

      deleteCommandMessages(msg, this.client);

      const message = await msg.embed(movieEmbed) as CommandoMessage;

      if (movieList.total_results > 1 && hasManageMessages) {
        injectNavigationEmotes(message);
        new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
          .on('collect', async (reaction: MessageReaction, user: User) => {
            if (!this.client.botIds.includes(user.id)) {
              if (reaction.emoji.name === '➡') position++;
              else position--;
              if (position >= movieList.total_results) position = 0;
              if (position < 0) position = movieList.total_results - 1;
              currentMovie = movieList.results[position].id;
              movie = await this.fetchAllData(currentMovie);
              movieEmbed = this.prepMessage(
                color, movie, movieList.total_results, position, hasManageMessages
              );
              message.edit(movieEmbed);
              message.reactions.get(reaction.emoji.name)!.users.remove(user);
            }
          });
      }

      return null;
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      return msg.reply(`no movies found for \`${name}\``);
    }
  }

  private async fetchAllData(movieId: number): Promise<TMDBMovie> {
    const movieStats = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?${stringify({ api_key: process.env.MOVIEDB_API_KEY! })}`);

    return movieStats.json();
  }

  private prepMessage(
    color: string, movie: TMDBMovie, movieSearchLength: number,
    position: number, hasManageMessages: boolean
  ): MessageEmbed {
    return new MessageEmbed()
      .setTitle(movie.title)
      .setURL(`https://www.themoviedb.org/movie/${movie.id}`)
      .setColor(color)
      .setImage(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
      .setThumbnail(`https://image.tmdb.org/t/p/original${movie.poster_path}`)
      .setDescription(movie.overview)
      .setFooter(hasManageMessages ? `Result ${position + 1} of ${movieSearchLength}` : '')
      .addField('Runtime', movie.runtime ? `${movie.runtime} minutes` : 'Movie in production', true)
      .addField('User Score', movie.vote_average ? movie.vote_average : 'Movie in production', true)
      .addField('Status', movie.status, true)
      .addField('Release Date', moment(movie.release_date).format('MMMM Do YYYY'), true)
      .addField('IMDB Page',
        movie.imdb_id ? `[Click Here](http://www.imdb.com/title/${movie.imdb_id})` : 'none',
        true)
      .addField('Home Page',
        movie.homepage ? `[Click Here](${movie.homepage})` : 'None',
        true)
      .addField('Collection',
        movie.belongs_to_collection ? movie.belongs_to_collection.name : 'Not part of a collection',
        false)
      .addField('Genres',
        movie.genres.length ? movie.genres.map((genre: MovieGenreType) => genre.name).join(', ') : 'None on TheMovieDB',
        false);
  }
}