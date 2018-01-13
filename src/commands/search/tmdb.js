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

/* eslint-disable no-mixed-requires*/

const Discord = require('discord.js'),
	auth = require('../../auth.json'),
	commando = require('discord.js-commando'),
	moment = require('moment'),
	moviedb = require('moviedb')(auth.TheMovieDBV3ApiKey),
	vibrant = require('node-vibrant');

module.exports = class movieCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'tmdb',
			'group': 'search',
			'aliases': ['movie'],
			'memberName': 'tmdb',
			'description': 'Finds movies and TV shows on TheMovieDB',
			'examples': ['tmdb {movie/tv show name}', 'tmdb Ocean\'s Eleven 2001'],
			'guildOnly': false,

			'args': [
				{
					'key': 'name',
					'prompt': 'Which movie or series do you want to find on TheMovieDB?',
					'type': 'string',
					'label': 'Movie or TV Show to look up',
					'default': 'now you see me'
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
		const movieEmbed = new Discord.MessageEmbed(),
			tmdb = (m, q) => new Promise((res, rej) => {
				moviedb[m](q, (err, data) => err ? rej(err) : res(data)); // eslint-disable-line no-confusing-arrow
			}),
			tmdbres = await tmdb('searchMovie', {'query': args.name});

		if (tmdbres) {
			const movieres = await tmdb('movieInfo', {'id': tmdbres.results[0].id});

			if (movieres) {
				movieEmbed
					.setImage(`http://image.tmdb.org/t/p/w640${movieres.backdrop_path}`)
					.setColor(await this.fetchColor(`http://image.tmdb.org/t/p/w640${movieres.backdrop_path}`))
					.addField('Title', `[${movieres.title}](https://www.themoviedb.org/movie/${movieres.id})`, true)
					.addField('Release Date', moment(movieres.release_date).format('MMMM Do YYYY'), true)
					.addField('Runtime', `${movieres.runtime} minutes`, true)
					.addField('User Score', movieres.vote_average, true)
					.addField('Genres', movieres.genres.map(genre => genre.name), true)
					.addField('Production Companies', movieres.production_companies.length === 0 ? movieres.production_companies.map(company => company.name) : 'Unavailable on TheMovieDB', true)
					.addField('Status', movieres.status, true)
					.addField('Collection', movieres.belongs_to_collection !== null ? movieres.belongs_to_collection.name : 'none', true)
					.addField('Home Page', movieres.homepage !== '' ? '[Click Here](idRes.homepage)' : 'none', true)
					.addField('IMDB Page', movieres.imdb_id_id !== '' ? `[Click Here](http://www.imdb.com/title/${movieres.imdb_id})` : 'none', true)
					.addField('Description', movieres.overview);

				this.deleteCommandMessages(msg);

				return msg.embed(movieEmbed);
			}

			return msg.reply('⚠️ ***nothing found***');
		}

		return msg.reply('⚠️ ***nothing found***');
	}
};