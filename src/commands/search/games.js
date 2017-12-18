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

/* eslint-disable max-statements */

const Discord = require('discord.js'),
	cheerio = require('cheerio'),
	commando = require('discord.js-commando'),
	moment = require('moment'),
	request = require('request');

const replaceAll = function (string, pattern, replacement) { // eslint-disable-line one-var
	return string.replace(new RegExp(pattern, 'g'), replacement);
};


module.exports = class gameCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'games',
			'group': 'search',
			'aliases': ['game', 'moby'],
			'memberName': 'games',
			'description': 'Finds info on a game on Mobygames',
			'examples': ['games {gameName}', 'games Tales of Berseria'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			
			'args': [
				{
					'key': 'gameData',
					'prompt': 'Please supply game title',
					'type': 'string',
					'label': 'Game to look up'
				}
			]
		});
	}

	run (msg, args) {
		
		const searchURL = `http://www.mobygames.com/search/quick?q=${replaceAll(args.gameData, / /, '+')}&p=-1&search=Go&sFilter=1&sG=on`;

		request({
			'uri': searchURL,
			'headers': {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'}
		},
		(err, resp, html) => {
			if (!err && resp.statusCode === 200) {
				const $ = cheerio.load(html);

				request({
					'uri': `http://www.mobygames.com${$('#searchResults > div > div:nth-child(2) > div > div.searchData > div.searchTitle > a').attr('href')}`,
					'headers': {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'}
				},
				(error, response, body) => {
					if (!error && response.statusCode === 200) {
						const cheerioLoader = cheerio.load(body);

						let descCombined = '',
							description = 'Potentially truncated due to maximum allowed length:\n',
							rating = '';

						if (cheerioLoader('.scoreHi:nth-child(1)').first()
							.text() === '' && cheerioLoader('.scoreLow:nth-child(1)').first()
								.text() === '') {
							rating = cheerioLoader('.scoreMed:nth-child(1)').first()
								.text();
						} else if (cheerioLoader('.scoreHi:nth-child(1)').first()
							.text() === '' && cheerioLoader('.scoreMed:nth-child(1)').first()
								.text() === '') {
							rating = cheerioLoader('.scoreLow:nth-child(1)').first()
								.text();
						} else {
							rating = cheerioLoader('.scoreHi:nth-child(1)').first()
								.text();
						}

						if (cheerioLoader('blockquote').length === 1) {
							descCombined = cheerioLoader('blockquote').text();
						} else {
							cheerioLoader('#ctrq').each(function () {
								const $set = [];
								let nxt = this.nextSibling; // eslint-disable-line no-invalid-this

								while (nxt) {
									if (!cheerioLoader(nxt).is('.sideBarLinks')) {
										$set.push(nxt);
										nxt = nxt.nextSibling;
									} else {
										break;
									}
								}

								for (let index = 0; index < $set.length; index += 1) {
									if ($set[index].data) {
										descCombined += $set[index].data;
									}
								}
							});
						}
						description += descCombined.slice(0, 970);
						const gameEmbed = new Discord.MessageEmbed(); // eslint-disable-line one-var

						gameEmbed.setColor('#E24141').setAuthor(cheerioLoader('.niceHeaderTitle > a').text(), 'https://i.imgur.com/oHwE0nC.png')
							.setImage(`http://www.mobygames.com${cheerioLoader('#coreGameCover > a > img').attr('src')}`)
							.setFooter(`Game info pulled from mobygames | ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`, 'http://i.imgur.com/qPuIzb2.png')
							.addField('Game Name', cheerioLoader('.niceHeaderTitle > a').text(), false);

						cheerioLoader('#coreGameRelease > div:contains("Released")').next()
							.children()
							.text() !== '' ? gameEmbed.addField('Release Date', cheerioLoader('#coreGameRelease > div:contains("Released")').next()
								.children()
								.text(), true) : gameEmbed.addField('Release Date', 'Release Date unknown', true);
						rating !== '' ? gameEmbed.addField('Rating', rating, true) : gameEmbed.addField('Rating', 'No rating available', true);
						cheerioLoader('#coreGameGenre > div > div:contains("Setting")').next()
							.children()
							.text() !== '' ? gameEmbed.addField('Setting', cheerioLoader('#coreGameGenre > div > div:contains("Setting")').next()
								.children()
								.text(), true) : gameEmbed.addField('Setting', 'No setting specified', true);
						`${cheerioLoader('#coreGameGenre > div > div:contains("Genre")').next()
							.text()},${cheerioLoader('#coreGameGenre > div > div:contains("Gameplay")').next()
							.text()}`.split(',').join(', ') !== '' ? gameEmbed.addField('Genre(s)', `${cheerioLoader('#coreGameGenre > div > div:contains("Genre")').next()
								.text()},${cheerioLoader('#coreGameGenre > div > div:contains("Gameplay")').next()
								.text()}`.split(',').join(', '), true) : gameEmbed.addField('Genre(s)', 'Genre(s) unknown', true);
						cheerioLoader('#coreGameRelease > div:contains("Platforms")').next() // eslint-disable-line no-nested-ternary
							.children()
							.text() === '' ? cheerioLoader('#coreGameRelease > div:contains("Platform")').next()
								.children()
								.text() : cheerioLoader('#coreGameRelease > div:contains("Platforms")').next()
								.text()
								.split(',')
								.join(', ') !== '' ? gameEmbed.addField('Platform(s)', cheerioLoader('#coreGameRelease > div:contains("Platforms")').next()
									.children()
									.text() === '' ? cheerioLoader('#coreGameRelease > div:contains("Platform")').next()
										.children()
										.text() : cheerioLoader('#coreGameRelease > div:contains("Platforms")').next()
										.text()
										.split(',')
										.join(', '), true) : gameEmbed.addField('Platform(s)', 'Platforms unknown', true);
						cheerioLoader('#coreGameRelease > div:contains("Developed by")').next()
							.children()
							.text() !== '' ? gameEmbed.addField('Developer', cheerioLoader('#coreGameRelease > div:contains("Developed by")').next()
								.children()
								.text(), true) : gameEmbed.addField('Developer', 'Developer unknown', true);
						cheerioLoader('#coreGameRelease > div:contains("Published by")').next()
							.children()
							.text() !== '' ? gameEmbed.addField('Publisher', cheerioLoader('#coreGameRelease > div:contains("Published by")').next()
								.children()
								.text(), true) : gameEmbed.addField('Publisher', 'Publisher unknown', true);
						cheerioLoader('#coreGameGenre > div > div:contains("ESRB Rating")').next()
							.children()
							.text() !== '' ? gameEmbed.addField('ESRB Rating', cheerioLoader('#coreGameGenre > div > div:contains("ESRB Rating")').next()
								.children()
								.text(), true) : gameEmbed.addField('ESRB Rating', 'ESRB Rating unknown', true);
						gameEmbed.addField('Description', description, false);

						return msg.embed(gameEmbed);
					}

					return console.error(error) && msg.reply('An error occured while getting the game\'s info'); // eslint-disable-line no-console
				});
			} else {
				return console.error(err) && msg.reply('An error occured while fetching search results'); // eslint-disable-line no-console
			}
			
			return null;
		});

	}
};