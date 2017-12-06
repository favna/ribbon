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
	Matcher = require('did-you-mean'),
	commando = require('discord.js-commando'),
	fs = require('fs'),
	path = require('path');

module.exports = class copypastaCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'copypasta',
			'aliases': ['cp', 'pasta'],
			'group': 'fun',
			'memberName': 'copypasta',
			'description': 'Sends contents of a copypasta file to the chat',
			'examples': ['copypasta <file_name>', 'copypasta navy'],
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
				}
			]
		});
	}

	run (msg, args) {
		const match = new Matcher();

		match.values = fs.readdirSync(path.join(__dirname, `pastas/${msg.guild.id}`));

		fs.readFile(path.join(__dirname, `pastas/${msg.guild.id}/${args.name}.txt`), (err, data) => {
			if (!err) {
				if (data.length <= 1024) {
					const cpEmbed = new Discord.MessageEmbed();

					cpEmbed.setDescription(data);

					return msg.embed(cpEmbed);
				}

				return msg.say(data, {'split': true});
			}
			const dym = match.get(`${args.name}.txt`),
				dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'You can save it with `$copypastaadd <filename> <content>`';

			return msg.reply(`⚠️ That copypata does not exist! ${dymString}`);
		});
	}
};