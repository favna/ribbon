/**
 * @file Searches TVCommand - Find information about a TV series using TheMovieDatabase
 *
 * **Aliases**: `tv`, `show`, `serie`, `series`
 * @module
 * @category searches
 * @name tvdb
 * @example tvdb Pokemon
 * @param {string} SeriesName Name of the TV serie you want to find
 */

import { stringify } from 'awesome-querystring';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import moment from 'moment';
import fetch from 'node-fetch';
import { DEFAULT_EMBED_COLOR, deleteCommandMessages, IMovieGenre, roundNumber, startTyping, stopTyping } from '../../components';

export default class TVCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'tvdb',
            aliases: ['tv'],
            group: 'searches',
            memberName: 'tvdb',
            description: 'Finds TV shows on TheMovieDB',
            format: 'MovieName [release_year_movie]',
            examples: ['tvdb Pokemon'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'name',
                    prompt: 'What TV serie do you want to find?',
                    type: 'string',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { name }: { name: string }) {
        try {
            startTyping(msg);
            const movieSearch = await fetch(`https://api.themoviedb.org/3/search/tv?${stringify({
                    api_key: process.env.MOVIEDB_API_KEY,
                    query: name,
                })}`
            );
            const showList = await movieSearch.json();
            const showStats = await fetch(`https://api.themoviedb.org/3/tv/${showList.results[0].id}?${stringify(
                { api_key: process.env.MOVIEDB_API_KEY })}`
            );
            const show = await showStats.json();
            const showEmbed = new MessageEmbed();

            showEmbed
                .setTitle(show.name)
                .setURL(`https://www.themoviedb.org/tv/${show.id}`)
                .setColor(msg.guild ? msg.member.displayHexColor : DEFAULT_EMBED_COLOR)
                .setImage(`https://image.tmdb.org/t/p/original${show.backdrop_path}`)
                .setThumbnail(`https://image.tmdb.org/t/p/original${show.poster_path}`)
                .setDescription(show.overview)
                .addField('Episode Runtime', `${show.episode_run_time} minutes`, true)
                .addField('Popularity', `${roundNumber(show.popularity, 2)}%`, true)
                .addField('Status', show.status, true)
                .addField('First air Date', moment(show.first_air_date).format('MMMM Do YYYY'), true)
                .addField(
                    'Genres',
                    show.genres.length ? show.genres.map((genre: IMovieGenre) => genre.name).join(', ') : 'None on TheMovieDB'
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(showEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`no shows found for \`${name}\``);
        }
    }
}
