/**
 * @file Searches IGDBCommand - Gets information about a game using Internet Game Database (IGDB)
 *
 * **Aliases**: `game`, `moby`, `games`
 * @module
 * @category searches
 * @name igdb
 * @example igdb Tales of Berseria
 * @param {string} GameName The name of any game that you want to find
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import fetch from 'node-fetch';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping, stringify } from '../../components';

export default class IGDBCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'igdb',
            aliases: ['game', 'moby', 'games'],
            group: 'searches',
            memberName: 'igdb',
            description: 'Gets information about a game using Internet Game Database (IGDB)',
            format: 'GameName',
            examples: ['igdb Tales of Berseria'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'game',
                    prompt: 'Which game do you want to look up on IGDB?',
                    type: 'string',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { game }: { game: string }) {
        startTyping(msg);
        try {
            const gameEmbed = new MessageEmbed();
            const headers = {
                headers: {
                    Accept: 'application/json',
                    'user-key': process.env.IGDB_API_KEY,
                },
            };

            const gameSearch = await fetch(
                `https://api-endpoint.igdb.com/games/?${stringify({
                    fields: ['name', 'url', 'summary', 'rating', 'developers', 'genres', 'release_dates', 'platforms', 'cover', 'esrb', 'pegi'].join(),
                    limit: 1,
                    offset: 0,
                    search: game,
                })}`,
                headers
            );
            const gameInfo = await gameSearch.json();
            const coverImg = (await gameInfo[0].cover.url.includes('http'))
                ? gameInfo[0].cover.url
                : `https:${gameInfo[0].cover.url}`;
            const releaseDate = moment(gameInfo[0].release_dates[0].date).format('MMMM Do YYYY');

            const companyFetch = await fetch(
                `https://api-endpoint.igdb.com/companies/${gameInfo[0].developers.join()}?${stringify(
                    {
                        fields: ['name'].join(),
                        limit: 1,
                        offset: 0,
                    }
                )}`,
                headers
            );
            const companyInfo = await companyFetch.json();

            const genreFetch = await fetch(
                `https://api-endpoint.igdb.com/genres/${gameInfo[0].genres.join()}?${stringify({ fields: ['name'].join() })}`,
                headers
            );
            const genreInfo = await genreFetch.json();

            const platformFetch = await fetch(
                `https://api-endpoint.igdb.com/platforms/${gameInfo[0].platforms.join()}?${stringify({ fields: ['name'].join() })}`,
                headers
            );
            const platformInfo = await platformFetch.json();

            gameEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
                .setTitle(gameInfo[0].name)
                .setURL(gameInfo[0].url)
                .setThumbnail(coverImg)
                .addField('User Score', roundNumber(gameInfo[0].rating, 1), true)
                .addField(
                    `${gameInfo[0].pegi ? 'PEGI' : 'ESRB'} rating`,
                    gameInfo[0].pegi
                        ? gameInfo[0].pegi.rating
                        : gameInfo[0].esrb.rating,
                    true
                )
                .addField('Release Date', releaseDate, true)
                .addField('Genres', this.extractNames(genreInfo), true)
                .addField('Developer', companyInfo[0].name, true)
                .addField('Platforms', this.extractNames(platformInfo), true)
                .setDescription(gameInfo[0].summary);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(gameEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`nothing found for \`${game}\``);
        }
    }

    private extractNames (arr: any[]) {
        let res = '';

        for (let i = 0; i < arr.length; ++i) {
            if (i !== arr.length - 1) {
                res += `${arr[i].name}, `;
            } else {
                res += `${arr[i].name}`;
            }
        }

        return res;
    }
}
