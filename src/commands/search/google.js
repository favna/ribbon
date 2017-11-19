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

const {googleapikey} = auth.googleapikey, // eslint-disable-line one-var
	{searchEngineKey} = auth.searchEngineKey;

module.exports = class googleCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'google',
			'group': 'search',
			'aliases': ['search', 'g'],
			'memberName': 'google',
			'description': 'Finds anything on google',
			'examples': ['google {searchQuery}', 'google Pyrrha Nikos'],
			'guildOnly': false,

			'args': [
				{
					'key': 'query',
					'prompt': 'What do you want to google?',
					'type': 'string',
					'label': 'Search query'
				}
			]
		});
	}

	run (msg, args) {
		const query = args.query
			.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '')
			.split(' ')
			.map(uriComponent => encodeURIComponent(uriComponent))
			.join('+');

		const KNOWLEDGE_PARAMS = { // eslint-disable-line one-var
			'key': googleapikey,
			'limit': 1,
			'indent': true,
			query
		};

		return superagent.get(`https://kgsearch.googleapis.com/v1/entities:search?${querystring.stringify(KNOWLEDGE_PARAMS)}`)
			.then((res) => {
				let result = res.body.itemListElement[0];

				if (!result || !result.result || !result.result.detailedDescription) {
					return Promise.reject(console.error('No search results')); // eslint-disable-line no-console
				}
				result = result.result;
				let types = result['@type'].map(t => t.replace(/([a-z])([A-Z])/g, '$1 $2')); // eslint-disable-line one-var

				if (types.length > 1) {
					types = types.filter(t => t !== 'Thing');
				}

				const LEARN_MORE_URL = result.detailedDescription.url.replace(/\(/, '%28').replace(/\)/, '%29'),
					description = `${result.detailedDescription.articleBody} [Learn More...](${LEARN_MORE_URL})`,
					title = `${result.name} ${types.length === 0 ? '' : `(${types.join(', ')})`}`;

				return msg.say(result.detailedDescription.url, title, description);
			})
			.catch((knowledgeErr) => { // eslint-disable-line no-unused-vars
				const safe = 'high';
				const REULAR_PARAMS = { // eslint-disable-line one-var 
					'key': googleapikey,
					'cx': searchEngineKey,
					safe,
					'q': encodeURI(query)
				};

				return superagent.get(`https://www.googleapis.com/customsearch/v1?${querystring.stringify(REULAR_PARAMS)}`)
					.then((res) => {
						if (res.body.queries.request[0].totalResults === '0') {
							return Promise.reject(console.error('NO RESULTS')); // eslint-disable-line no-console
						}

						return msg.say(res.body.items[0].link);
					})
					.catch(() => {
						const SEARCH_URL = `https://www.google.com/search?safe=${safe}&q=${encodeURI(query)}`;
						
						return superagent.get(SEARCH_URL).then((res) => {
							const $ = cheerio.load(res.text);
							let href = $('.r').first()
								.find('a')
								.first()
								.attr('href');

							if (!href) {
								return Promise.reject(console.error('NO SEARCH RESULTS')); // eslint-disable-line no-console
							}
							href = querystring.parse(href.replace('/url?', ''));

							return msg.say(href.q);
						});
					})
					.catch(searchErr => console.error(`A  serach error occured \n ${searchErr}`) && msg.say('**No Results Found!**')); // eslint-disable-line no-console
			});
	}
};