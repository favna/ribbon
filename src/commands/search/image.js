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
	auth = require('../../auth.json'),
	cheerio = require('cheerio'),
	commando = require('discord.js-commando'),
	querystring = require('querystring'),
	superagent = require('superagent'),
	vibrant = require('node-vibrant');

const googleapikey = auth.googleapikey, // eslint-disable-line one-var
	imageEngineKey = auth.imageEngineKey;

module.exports = class imageCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'image',
			'group': 'search',
			'aliases': ['img', 'i'],
			'memberName': 'image',
			'description': 'Finds an image through google',
			'examples': ['image {imageQuery}', 'image Pyrrha Nikos'],
			'guildOnly': false,

			'args': [
				{
					'key': 'query',
					'prompt': 'What do you want to find images of?',
					'type': 'string',
					'label': 'Search query'
				}
			]
		});
		this.embedColor = '#FF0000';
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
		const embed = new Discord.MessageEmbed(),
			query = args.query
				.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '')
				.split(' ')
				.map(x => encodeURIComponent(x))
				.join('+'),
			safe = msg.channel.nsfw ? 'medium' : 'off',
			QUERY_PARAMS = { // eslint-disable-line sort-vars
				'cx': imageEngineKey,
				'key': googleapikey,
				safe,
				'searchType': 'image'
			};

		let hexColor = this.embedColor,
			res = await superagent.get(`https://www.googleapis.com/customsearch/v1?${querystring.stringify(QUERY_PARAMS)}&q=${encodeURI(query)}`);

		if (res && res.body.items) {
			hexColor = await this.fetchColor(res.body.items[0].link);

			embed
				.setColor(hexColor)
				.setImage(res.body.items[0].link)
				.setFooter(`Search query: "${args.query}"`);

			return msg.embed(embed);
		}

		if (!res) {
			res = await superagent.get(`https://www.google.com/search?tbm=isch&gs_l=img&safe=${safe}&q=${encodeURI(query)}`);

			const $ = cheerio.load(res.text),
				result = $('.images_table').find('img')
					.first()
					.attr('src');

			hexColor = await this.fetchColor(result);
			embed
				.setColor(hexColor)
				.setImage(result)
				.setFooter(`Search query: "${args.query}"`);

			return msg.embed(embed);
		}

		return msg.reply('**no results found 😦**');
	}
};