/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

const Discord = require('discord.js'),
	SteamAPI = require('steamapi'),
	auth = require('../../auth.json'),
	cheerio = require('cheerio'),
	commando = require('discord.js-commando'),
	currencySymbol = require('currency-symbol-map'),
	request = require('request');

const insert = function (str, index, value) { // eslint-disable-line one-var
		return str.substring(0, index) + value + str.substring(index);
	},
	replaceAll = function (string, pattern, replacement) {
		return string.replace(new RegExp(pattern, 'g'), replacement);
	},
	steam = new SteamAPI(auth.steamAPIKey);


module.exports = class steamCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'steam',
			'group': 'search',
			'aliases': ['valve'],
			'memberName': 'steam',
			'description': 'Finds a game on Steam',
			'examples': ['steam {steamGameName}', 'steam Tales of Berseria'],
			'guildOnly': false,

			'args': [
				{
					'key': 'steamGameName',
					'prompt': 'What game do you want to find on the steam store?',
					'type': 'string',
					'label': 'Game to look up'
				}
			]
		});
	}

	run (msg, args) {
		request({
			'uri': `http://store.steampowered.com/search/?term=${replaceAll(args.steamGameName, / /, '+')}`,
			'headers': {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'}
		},
		(err, resp, body) => {
			if (!err && resp.statusCode === 200) {
				const cheerioLoader = cheerio.load(body),
					gameID = cheerioLoader('#search_result_container > div:nth-child(2) > a:nth-child(2)').attr('href')
						.split('/')[4];

				steam.getGameDetails(gameID).then((data) => {

					const genres = [],
						platforms = [];

					data.platforms.windows ? platforms.push('Windows') : null;
					data.platforms.mac ? platforms.push('MacOS') : null;
					data.platforms.linux ? platforms.push('Linux') : null;

					for (const index in data.genres) {
						genres.push(data.genres[index].description);
					}
					const steamEmbed = new Discord.MessageEmbed(); // eslint-disable-line one-var

					steamEmbed
						.setColor('#FF0000')
						.setTitle(data.name)
						.setURL(`http://store.steampowered.com/app/${data.steam_appid}/`)
						.setImage(data.header_image)
						.setDescription(cheerio.load(data.short_description).text())
						.addField(`Price in ${data.price_overview.currency}`, `${currencySymbol(data.price_overview.currency)}${insert(data.price_overview.final.toString(), 2, ',')}`, true)
						.addField('Release Date', data.release_date.date, true)
						.addField('Platforms', platforms.join(', '), true)
						.addField('Controller Support', data.controller_support ? data.controller_support : 'None', true)
						.addField('Age requirement', data.required_age !== 0 ? data.required_age : 'Everyone / Not in API', true)
						.addField('Genres', genres.join(', '), true)
						.addField('Developer(s)', data.developers, true)
						.addField('Publisher(s)', data.publishers, true)
						.addField('Steam Store Link', `http://store.steampowered.com/app/${data.steam_appid}/`, false);

					return msg.embed(steamEmbed);
				});

			} else {
				console.error(err); // eslint-disable-line no-console

				return msg.reply('⚠️ An error occured while getting the store search result');
			}

			return msg.reply('⚠️ An error occured while getting the store search result');
		}

		);
	}
};