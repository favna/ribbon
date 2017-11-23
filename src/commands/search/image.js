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

const auth = require('../../auth.json'),
	cheerio = require('cheerio'),
	commando = require('discord.js-commando'),
	querystring = require('querystring'),
	superagent = require('superagent');

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
	}

	run (msg, args) {
		const query = args.query // Is basically the search sent by you
			.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '')
			.split(' ')
			.map(x => encodeURIComponent(x))
			.join('+');
		const safe = msg.channel.nsfw ? 'medium' : 'off', // eslint-disable-line one-var
			QUERY_PARAMS = { // eslint-disable-line sort-vars
				'searchType': 'image',
				'key': googleapikey,
				'cx': imageEngineKey,
				safe
			};

		return superagent.get(`https://www.googleapis.com/customsearch/v1?${querystring.stringify(QUERY_PARAMS)}&q=${encodeURI(query)}`)
			.then(res => msg.say(res.body.items[0].link))
			.catch(() =>
				superagent.get(`https://www.google.com/search?tbm=isch&gs_l=img&safe=${safe}&q=${encodeURI(query)}`)
					.then((res) => {
						const cheerioLoader = cheerio.load(res.text),
							result = cheerioLoader('.images_table').find('img')
								.first()
								.attr('src');

						return result ? msg.say(result) : msg.say('**Something went wrong with the result, perhaps only nsfw results were found outside of an nsfw channel**');
					})
			)
			.catch((err) => {
				msg.say('**No Results Found**');
				console.error(err); // eslint-disable-line no-console
			});
	}
};