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
	commando = require('discord.js-commando'),
	maljs = require('maljs'),
	vibrant = require('node-vibrant');

module.exports = class animeCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'anime',
			'group': 'search',
			'aliases': ['ani', 'mal'],
			'memberName': 'anime',
			'description': 'Finds anime on MyAnimeList',
			'examples': ['anime {anime_name}', 'anime Pokemon'],
			'guildOnly': false,

			'args': [
				{
					'key': 'query',
					'prompt': 'What anime do you want to find?',
					'type': 'string',
					'label': 'anime_name'
				}
			]
		});
		this.embedColor = '#FF0000';
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get('global', 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	async fetchColor (img) {

		const palette = await vibrant.from(img).getPalette();

		if (palette) {
			const pops = [],
				swatches = Object.values(palette);

			let prominentSwatch = {};

			for (const swatch in swatches) {
				if (swatches[swatch]) {
					pops.push(swatches[swatch]._population); // eslint-disable-line no-underscore-dangle
				}
			}

			const highestPop = pops.reduce((a, b) => Math.max(a, b)); // eslint-disable-line one-var

			for (const swatch in swatches) {
				if (swatches[swatch]) {
					if (swatches[swatch]._population === highestPop) { // eslint-disable-line no-underscore-dangle
						prominentSwatch = swatches[swatch];
						break;
					}
				}
			}
			this.embedColor = prominentSwatch.getHex();
		}

		return this.embedColor;
	}

	async run (msg, args) {
		const aniEmbed = new Discord.MessageEmbed(),
			res = await maljs.quickSearch(args.query, 'anime');

		if (res) {
			const anime = await res.anime[0].fetch();

			if (anime) {

				aniEmbed
					.setColor(await this.fetchColor(anime.cover))
					.setTitle(anime.title)
					.setImage(anime.cover)
					.setDescription(anime.description)
					.setURL(`${anime.mal.url}${anime.path}`)
					.addField('Score', anime.score, true)
					.addField('Popularity', anime.popularity, true)
					.addField('Rank', anime.ranked, true);

				msg.embed(aniEmbed, `${anime.mal.url}${anime.path}`);
			}
		}
	}
};