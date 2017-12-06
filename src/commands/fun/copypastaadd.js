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

const commando = require('discord.js-commando'),
	fs = require('fs'),
	path = require('path');

module.exports = class copypastaAddCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'copypastaadd',
			'aliases': ['cpadd', 'pastaadd'],
			'group': 'fun',
			'memberName': 'copypastaadd',
			'description': 'Saves a copypasta to local file',
			'examples': ['copypasta <file_name> <pasta>', 'copypasta navy what the fuck did you just say to me ... (etc.)'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'name',
					'prompt': 'Send which copypasta?',
					'type': 'string',
					'label': 'Name of the file that has your copypasta content',
					'parse': p => p.toLowerCase()
				},
				{
					'key': 'content',
					'prompt': 'What should be stored in the copypasta?',
					'type': 'string',
					'label': 'The content stored in the copypasta file'
				}
			]
		});
	}

	run (msg, args) {
		fs.writeFile(path.join(__dirname, `pastas/${msg.guild.id}/${args.name}.txt`), args.content, 'utf8', (err) => {
			if (!err) {
				return msg.reply(`Copypasta stored in ${args.name}.txt. You can summon it with $copypasta ${args.name}`);
			}

			return msg.reply('An error occured and your pasta was not saved.');
		});
	}
};