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
	malware = require('malapi').Anime;

module.exports = class animeCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'anime',
			'group': 'search',
			'aliases': ['ani', 'mal'],
			'memberName': 'anime',
			'description': 'Find anime on MyAnimeList',
			'examples': ['anime {animeName}', 'anime Yu-Gi-Oh'],
			'guildOnly': false,
			'throttling': {
				'usages': 1,
				'duration': 60
			},

			'args': [
				{
					'key': 'query',
					'prompt': 'What anime do you want to find?',
					'type': 'string',
					'label': 'Anime to look up'
				}
			]
		});
	}

	run (msg, args) {
		malware.fromName(args.query).then((anime) => {
			const animeEmbed = new Discord.MessageEmbed(); // eslint-disable-line one-var

			animeEmbed
				.setAuthor(args.query, 'https://myanimelist.cdn-dena.com/img/sp/icon/apple-touch-icon-256.png')
				.setColor('#FF0000')
				.setImage(anime.image)
				.setURL(`https://myanimelist.net/anime/${anime.id}`);

			if (anime.alternativeTitles.japanese) {
				animeEmbed.addField('Japanese name', anime.alternativeTitles.japanese, true);
			} else {
				animeEmbed.addField('Japanese name', 'None', true);
			}

			if (anime.alternativeTitles.english) {
				animeEmbed.addField('English name', anime.alternativeTitles.english, true);
			} else {
				animeEmbed
					.addField('English name', 'None', true)
					.addBlankField(true);
			}


			if (anime.synopsis.length >= 1024) {
				animeEmbed.addField('Synposis',
					`The synopsis for this anime exceeds the maximum length, check the full synopsis on myanimelist.\nSynopsis Snippet:\n${anime.synopsis.slice(0, 500)}`);
			} else {
				animeEmbed.addField('Synposis', anime.synopsis, false);
			}

			anime.statistics.score.value !== '' ? animeEmbed.addField('Score', anime.statistics.score.value, true) : animeEmbed.addField('Score', 'Score unknown', true);
			animeEmbed
				.addField('Episodes', anime.episodes, true)
				.addField('Status', anime.status, true)
				.addField('URL', `https://myanimelist.net/anime/${anime.id}`, true);

			return msg.embed(animeEmbed);
		})
			.catch((err) => {
				console.error(err); // eslint-disable-line no-console

				return msg.reply('⚠️ No results found. An error was logged to your error console');
			});

	}
};