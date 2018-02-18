/*
 *   This file is part of ribbon
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

const Fuse = require('fuse.js'),
	commando = require('discord.js-commando'),
	fs = require('fs'),
	path = require('path'),
	{MessageEmbed} = require('discord.js'),
	{oneLine} = require('common-tags'),
	{deleteCommandMessages} = require('../../util.js');

module.exports = class EshopCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'eshop',
			'memberName': 'eshop',
			'group': 'search',
			'aliases': ['shop'],
			'description': 'Gets any game from the Nintendo eShop',
			'format': 'GameName',
			'examples': ['eshop Breath of the Wild'],
			'guildOnly': false,
			'args': [
				{
					'key': 'game',
					'prompt': 'What game to find?',
					'type': 'string'
				}
			]
		});
	}

	run (msg, args) {
		if (fs.existsSync(path.join(__dirname, '../../data/websearch/eshop.json'))) {

			/* eslint-disable sort-vars, no-var, vars-on-top, one-var*/
			const embed = new MessageEmbed(),
				fsoptions = {
					'shouldSort': true,
					'threshold': 0.6,
					'location': 0,
					'distance': 100,
					'maxPatternLength': 32,
					'minMatchCharLength': 1,
					'keys': ['title']
				},
				games = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/websearch/eshop.json', 'utf8'))),
				fuse = new Fuse(games, fsoptions),
				results = fuse.search(args.game);
			/* eslint-enable sort-vars*/

			embed
				.setTitle(results[0].title)
				.setURL(`https://www.nintendo.com/games/detail/${results[0].slug}`)
				.setThumbnail(results[0].front_box_art)
				.setColor('#FFA600')
				.addField('eShop Price', `$${results[0].eshop_price} USD`, true)
				.addField('Release Date', results[0].release_date, true)
				.addField('Number of Players', results[0].number_of_players, true)
				.addField('Available', results[0].buyitnow ? 'Yes' : 'No', true)
				.addField('Game Code', results[0].game_code, true)
				.addField('NSUID', results[0].nsuid, true)
				.addField('Digital Download', results[0].digitaldownload ? 'Yes' : 'No', true)
				.addField('Categories', typeof results[0].categories.category === 'object' ? results[0].categories.category.join(', ') : results[0].categories.category, true);

			deleteCommandMessages(msg, this.client);

			return msg.embed(embed);
		}

		return msg.reply(oneLine `ehsop data was not found!!
		Ask <@${this.client.owners[0].id}> to generate it`);
	}
};