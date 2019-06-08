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

import { CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, roundNumber } from '@components/Utils';
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, User } from 'awesome-djs';
import moment from 'moment';
import fetch from 'node-fetch';
import { MovieGenreType, TMDBSerie, TVDBSeriesList } from 'RibbonTypes';

type TVArgs = {
    name: string;
    hasManageMessages: boolean;
    position: number;
};

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

    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { name, hasManageMessages, position = 0 }: TVArgs) {
        try {
            const movieSearch = await fetch(`https://api.themoviedb.org/3/search/tv?${stringify({
                api_key: process.env.MOVIEDB_API_KEY!,
                query: name,
            })}`);
            const color = msg.guild ? msg.member!.displayHexColor : DEFAULT_EMBED_COLOR;
            const showList: TVDBSeriesList = await movieSearch.json();

            let currentSeries = showList.results[position].id;
            let show = await this.fetchAllData(currentSeries);
            let showEmbed = this.prepMessage(color, show, showList.total_results, position, hasManageMessages);

            deleteCommandMessages(msg, this.client);

            const message = await msg.embed(showEmbed) as CommandoMessage;

            if (showList.total_results > 1 && hasManageMessages) {
                injectNavigationEmotes(message);
                new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
                    .on('collect', async (reaction: MessageReaction, user: User) => {
                        if (!this.client.userid.includes(user.id)) {
                            reaction.emoji.name === '➡' ? position++ : position--;
                            if (position >= showList.total_results) position = 0;
                            if (position < 0) position = showList.total_results - 1;
                            currentSeries = showList.results[position].id;
                            show = await this.fetchAllData(currentSeries);
                            showEmbed = this.prepMessage(color, show, showList.total_results, position, hasManageMessages);
                            message.edit(showEmbed);
                            message.reactions.get(reaction.emoji.name)!.users.remove(user);
                        }
                    });
            }

            return null;
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`no shows found for \`${name}\``);
        }
    }

    private async fetchAllData (serieId: number): Promise<TMDBSerie> {
        const seriesStats = await fetch(`https://api.themoviedb.org/3/tv/${serieId}?${stringify(
            { api_key: process.env.MOVIEDB_API_KEY! })}`
        );
        return seriesStats.json();
    }

    private prepMessage (
        color: string, show: any, seriesSearchLength: number,
        position: number, hasManageMessages: boolean
    ): MessageEmbed {
        return new MessageEmbed()
            .setTitle(show.name)
            .setURL(`https://www.themoviedb.org/tv/${show.id}`)
            .setColor(color)
            .setImage(`https://image.tmdb.org/t/p/original${show.backdrop_path}`)
            .setThumbnail(`https://image.tmdb.org/t/p/original${show.poster_path}`)
            .setDescription(show.overview)
            .setFooter(hasManageMessages ? `Result ${position + 1} of ${seriesSearchLength}` : '')
            .addField('Episode Runtime', `${show.episode_run_time} minutes`, true)
            .addField('Popularity', `${roundNumber(show.popularity, 2)}%`, true)
            .addField('Status', show.status, true)
            .addField('First air Date', moment(show.first_air_date).format('MMMM Do YYYY'), true)
            .addField(
                'Genres',
                show.genres.length ? show.genres.map((genre: MovieGenreType) => genre.name).join(', ') : 'None on TheMovieDB'
            );
    }
}
