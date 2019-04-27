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

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { MovieGenreType } from '@components/Types';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import moment from 'moment';
import fetch from 'node-fetch';

export default class MovieCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'tmdb',
            aliases: ['movie'],
            group: 'searches',
            memberName: 'tmdb',
            description: 'Finds movies on TheMovieDB',
            format: 'MovieName [release_year_movie]',
            examples: ['tmdb Ocean\'s Eleven 2001'],
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

    public async run (msg: CommandoMessage, { name }: { name: string }) {
        try {
            const movieSearch = await fetch(`https://api.themoviedb.org/3/search/movie?${stringify({
                    api_key: process.env.MOVIEDB_API_KEY!,
                    query: name,
                })}`
            );
            const movieList = await movieSearch.json();
            const movieStats = await fetch(`https://api.themoviedb.org/3/movie/${movieList.results[0].id}?${stringify(
                { api_key: process.env.MOVIEDB_API_KEY! })}`
            );
            const movie = await movieStats.json();
            const movieEmbed = new MessageEmbed();

            movieEmbed
                .setTitle(movie.title)
                .setURL(`https://www.themoviedb.org/movie/${movie.id}`)
                .setColor(msg.guild ? msg.member!.displayHexColor : DEFAULT_EMBED_COLOR)
                .setImage(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
                .setThumbnail(`https://image.tmdb.org/t/p/original${movie.poster_path}`)
                .setDescription(movie.overview)
                .addField('Runtime', movie.runtime ? `${movie.runtime} minutes` : 'Movie in production', true)
                .addField('User Score', movie.vote_average ? movie.vote_average : 'Movie in production', true)
                .addField('Status', movie.status, true)
                .addField('Release Date', moment(movie.release_date).format('MMMM Do YYYY'), true)
                .addField(
                    'IMDB Page',
                    movie.imdb_id ? `[Click Here](http://www.imdb.com/title/${movie.imdb_id})` : 'none',
                    true
                )
                .addField(
                    'Home Page',
                    movie.homepage ? `[Click Here](${movie.homepage})` : 'None',
                    true
                )
                .addField(
                    'Collection',
                    movie.belongs_to_collection ? movie.belongs_to_collection.name : 'Not part of a collection',
                    false
                )
                .addField(
                    'Genres',
                    movie.genres.length ? movie.genres.map((genre: MovieGenreType) => genre.name).join(', ') : 'None on TheMovieDB',
                    false
                );

            deleteCommandMessages(msg, this.client);

            return msg.embed(movieEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`no movies found for \`${name}\``);
        }
    }
}
