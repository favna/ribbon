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
	moment = require('moment'),
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
					'prompt': 'What is the name of the copypasta you want to save?',
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

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	run (msg, args) {
		if (!fs.existsSync(path.join(__dirname, `pastas/${msg.guild.id}`))) {
			console.log(`Creating guild dir for guild ${msg.guild.name}(${msg.guild.id}) at ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`); // eslint-disable-line no-console
			fs.mkdirSync(path.join(__dirname, `pastas/${msg.guild.id}`));
		}

		fs.writeFileSync(path.join(__dirname, `pastas/${msg.guild.id}/${args.name}.txt`), args.content, 'utf8');

		if (fs.existsSync(path.join(__dirname, `pastas/${msg.guild.id}/${args.name}.txt`))) {
			this.deleteCommandMessages(msg);

			return msg.reply(`Copypasta stored in ${args.name}.txt. You can summon it with ${msg.guild.commandPrefix}copypasta ${args.name}`);
		}

		return msg.reply('⚠️ An error occured and your pasta was not saved.');
	}
};