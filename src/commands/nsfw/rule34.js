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

const booru = require('booru'),
	commando = require('discord.js-commando'),
	{deleteCommandMessages} = require('../../util.js');

module.exports = class rule34Command extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'rule34',
			'memberName': 'rule34',
			'group': 'nsfw',
			'aliases': ['r34'],
			'description': 'Find NSFW Content on Rule34',
			'format': 'NSFWToLookUp',
			'examples': ['rule34 Pyrrha Nikos'],
			'guildOnly': false,
			'nsfw': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'nsfwtags',
					'prompt': 'What do you want to find NSFW for?',
					'type': 'string'
				}
			]
		});
	}

	async run (msg, args) {
		try {
			const booruData = await booru.search('r34', args.nsfwtags.split(' '), {
				'limit': 1,
				'random': true
			}).then(booru.commonfy);

			if (booruData) {
				deleteCommandMessages(msg, this.client);

				return msg.say(`Score: ${booruData[0].common.score}\nImage: ${booruData[0].common.file_url}`);
			}
			deleteCommandMessages(msg, this.client);

			return msg.reply('⚠️ No juicy images found.');
		} catch (BooruError) {
			deleteCommandMessages(msg, this.client);

			return msg.reply('⚠️ No juicy images found.');
		}
	}
};