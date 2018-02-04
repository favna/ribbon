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
	{fetchColor} = require('../../util.js'),
	{deleteCommandMessages} = require('../../util.js');

module.exports = class animeCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'anime',
			'memberName': 'anime',
			'group': 'search',
			'aliases': ['ani', 'mal'],
			'description': 'Finds anime on MyAnimeList',
			'format': 'AnimeName',
			'examples': ['anime Pokemon'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'query',
					'prompt': 'What anime do you want to find?',
					'type': 'string'
				}
			]
		});
		this.embedColor = '#FF0000';
	}

	async run (msg, args) {
		const aniEmbed = new Discord.MessageEmbed(),
			res = await maljs.quickSearch(args.query, 'anime');

		if (res) {
			const anime = await res.anime[0].fetch();

			if (anime) {

				aniEmbed
					.setColor(await fetchColor(anime.cover, this.embedColor))
					.setTitle(anime.title)
					.setImage(anime.cover)
					.setDescription(anime.description)
					.setURL(`${anime.mal.url}${anime.path}`)
					.addField('Score', anime.score, true)
					.addField('Popularity', anime.popularity, true)
					.addField('Rank', anime.ranked, true);

				deleteCommandMessages(msg, this.client);

				msg.embed(aniEmbed, `${anime.mal.url}${anime.path}`);
			}
		}
	}
};