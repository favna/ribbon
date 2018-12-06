/**
 * @file Searches SteamCommand - Gets information about a game using Steam
 *
 * **Aliases**: `valve`
 * @module
 * @category searches
 * @name steam
 * @example steam Tales of Berseria
 * @param {StringResolvable} GameName The name of any game that you want to find
 */

import * as cheerio from 'cheerio';
import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import * as striptags from 'striptags';
import { currencymap, deleteCommandMessages, ISteamGenre, startTyping, stopTyping, stringify } from '../../components';

export default class SteamCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'steam',
            aliases: ['valve'],
            group: 'searches',
            memberName: 'steam',
            description: 'Finds a game on Steam',
            format: 'GameName',
            examples: ['steam Tales of Berseria'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'game',
                    prompt: 'Which game do you want to find on the steam store?',
                    type: 'string',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { game }: { game: string }) {
        try {
            startTyping(msg);

            const steamEmbed = new MessageEmbed();
            const steamSearch = await fetch(`http://store.steampowered.com/search/?${stringify({
                    category1: 998,
                    term: game,
                })}`
            );
            const $ = cheerio.load(await steamSearch.text());
            const gameID = $('#search_result_container > div:nth-child(2) > a:nth-child(2)')
                .attr('href')
                .split('/')[4];
            const steamFetch = await fetch(`https://store.steampowered.com/api/appdetails?${stringify({
                    appids: gameID,
                    key: process.env.STEAM_API_KEY,
                })}`, { headers: { 'User-Agent': 'Ribbon Discord Bot (https://github.com/ribbon)' } }
            );
            const steamResponse = await steamFetch.json();
            const steamData = steamResponse[gameID].data;
            const genres: string[] = [];
            const platforms: string[] = [];

            if (steamData.platforms.windows) platforms.push('Windows');
            if (steamData.platforms.mac) platforms.push('MacOS');
            if (steamData.platforms.linux) platforms.push('Linux');

            steamData.genres.forEach((genre: ISteamGenre) => {
                genres.push(genre.description);
            });

            steamEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
                .setTitle(steamData.name)
                .setURL(`http://store.steampowered.com/app/${steamData.steam_appid}/`)
                .setImage(steamData.header_image)
                .setDescription(striptags(steamData.short_description))
                .addField(
                    steamData.price_overview ? `Price in ${steamData.price_overview.currency}` : 'Price',
                    steamData.price_overview
                        ? `${currencymap(steamData.price_overview.currency)}${this.insert(steamData.price_overview.final.toString(), ',')}`
                        : 'Free',
                    true
                )
                .addField('Release Date', steamData.release_date.date, true)
                .addField('Platforms', platforms.join(', '), true)
                .addField('Controller Support', steamData.controller_support ? steamData.controller_support : 'None', true)
                .addField('Age requirement', steamData.required_age !== 0 ? steamData.required_age : 'Everyone / Not in API', true)
                .addField('Genres', genres.join(', '), true)
                .addField('Developer(s)', steamData.developers, true)
                .addField('Publisher(s)', steamData.publishers, true)
                .addField('Steam Store Link', `http://store.steampowered.com/app/${steamData.steam_appid}/`, false);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(steamEmbed, `http://store.steampowered.com/app/${steamData.steam_appid}/`);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`nothing found for \`${game}\``);
        }
    }

    private insert (str: string, value: any) {
        return (str.substring(0, str.length - 2) + value + str.substring(str.length - 2));
    }
}
