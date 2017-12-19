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
	{oneLine} = require('common-tags'),
	tmdb = require('moviedb')(auth.TheMovieDBV3ApiKey);

let movieID = '';

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
			'throttling': {
				'usages': 1,
				'duration': 60
			},

			'args': [
				{
					'key': 'name',
					'prompt': 'Please supply movie title',
					'type': 'string',
					'label': 'Movie or TV Show to look up'
				}
			]
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	run (msg, args) {
		tmdb.searchMovie({'query': args.name}, (nameErr, nameRes) => {
			if (nameErr) {
				// eslint-disable-next-line no-console
				console.error(oneLine `An error occured in the "tmdb" command in the server ${msg.guild.name} (${msg.guild.id}) 
				on ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}. The error is: ${nameErr}`);
				this.deleteCommandMessages(msg);

				return msg.reply('An error occured');
			}

			if (nameRes.results.length !== 0) {
				movieID = nameRes.results[0].id;
			} else {

				this.deleteCommandMessages(msg);

				return msg.reply('⚠️ ***nothing found***');
			}

			tmdb.movieInfo({'id': movieID}, (idErr, idRes) => {
				if (!idErr) {
					const movieEmbed = new Discord.MessageEmbed();

					movieEmbed
						.setImage(`http://image.tmdb.org/t/p/w640${idRes.backdrop_path}`)
						.setColor('#E24141')
						.addField('Title', `[${idRes.title}](https://www.themoviedb.org/movie/${idRes.id})`, true)
						.addField('Release Date', moment(idRes.release_date).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'), true)
						.addField('Runtime', `${idRes.runtime} minutes`, true)
						.addField('User Score', idRes.vote_average, true)
						.addField('Genres', idRes.genres.map(genre => genre.name), true)
						.addField('Production Companies', idRes.production_companies.length === 0 ? idRes.production_companies.map(company => company.name) : 'Unavailable on TheMovieDB', true)
						.addField('Status', idRes.status, true)
						.addField('Collection', idRes.belongs_to_collection !== null ? idRes.belongs_to_collection.name : 'none', true)
						.addField('Home Page', idRes.homepage !== '' ? '[Click Here](idRes.homepage)' : 'none', true)
						.addField('IMDB Page', idRes.imdb_id_id !== '' ? `[Click Here](http://www.imdb.com/title/${idRes.imdb_id})` : 'none', true)
						.addField('Description', idRes.overview);

					this.deleteCommandMessages(msg);

					return msg.embed(movieEmbed);
				}

				// eslint-disable-next-line no-console
				console.error(oneLine `An error occured in the "tmdb" command in the server ${msg.guild.name} (${msg.guild.id}) 
									on ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}. The error is: ${idErr}`);
				this.deleteCommandMessages(msg);

				return msg.reply('An error occured');

			});
			
			return null;
		});
	}
};