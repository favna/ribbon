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

import { oneLine } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import fetch from 'node-fetch';
import { deleteCommandMessages, IGBDAgeRatings, IIGDBAgeRating, IIGDBInvolvedCompany, IIGDBProp, roundNumber, startTyping, stopTyping } from '../../components';

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
                Accept: 'application/json',
                'user-key': process.env.IGDB_API_KEY,
            };

            const igdbSearch = await fetch('https://api-v3.igdb.com/games', {
                body: oneLine`
                    search "${game}";
                    fields name, url, summary, rating, involved_companies.developer,
                           involved_companies.company.name, genres.name, release_dates.date,
                           platforms.name, cover.url, age_ratings.rating, age_ratings.category;
                    where age_ratings != n;
                    limit 1;
                    offset 0;
                `,
                headers,
                method: 'POST',
            });
            const gameInfo = await igdbSearch.json();
            const hit = gameInfo[0];
            const coverImg = /https?:/i.test(hit.cover.url) ? hit.cover.url : `https:${hit.cover.url}`;

            gameEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : process.env.DEFAULT_EMBED_COLOR)
                .setTitle(hit.name)
                .setURL(hit.url)
                .setThumbnail(coverImg)
                .addField('User Score', roundNumber(hit.rating, 1), true)
                .addField('Age Rating(s)', hit.age_ratings.map((e: IIGDBAgeRating) => `${e.category === 1 ? 'ESRB' : 'PEGI'}: ${IGBDAgeRatings[e.rating]}`), true)
                .addField('Release Date', moment.unix(hit.release_dates[0].date).format('MMMM Do YYYY'), true)
                .addField('Genre(s)', hit.genres.map((genre: IIGDBProp) => genre.name).join(', '), true)
                .addField('Developer(s)', hit.involved_companies.map((e: IIGDBInvolvedCompany) => e.developer ? e.company.name : null).filter(Boolean).join(', '), true)
                .addField('Platform(s)', hit.platforms.map((e: IIGDBProp) => e.name).join(', '), true)
                .setDescription(hit.summary);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(gameEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`nothing found for \`${game}\``);
        }
    }
}
