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

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	run (msg, args) {
		/* eslint-disable sort-vars */
		const match = new Matcher(),
			dym = match.get(`${args.name}.txt`),
			dymString = dym !== null ? `Did you mean \`${dym}\`?` : `You can save it with \`${msg.guild.commandPrefix}copypastaadd <filename> <content>\` or verify the file name manually`;
		/* eslint-enable sort-vars */

		match.values = fs.readdirSync(path.join(__dirname, `pastas/${msg.guild.id}`));

		try {
			let pastaContent = fs.readFileSync(path.join(__dirname, `pastas/${msg.guild.id}/${args.name}.txt`), 'utf8');

			if (pastaContent) {
				if (pastaContent.length <= 1024) {
					/* eslint-disable no-nested-ternary */
					const cpEmbed = new Discord.MessageEmbed(),
						ext = pastaContent.includes('.png') ? '.png'
							: pastaContent.includes('.jpg') ? '.jpg'
								: pastaContent.includes('.gif') ? '.gif'
									: pastaContent.includes('.webp') ? '.webp' : 'none',
						header = ext !== 'none' ? pastaContent.includes('https') ? 'https' : 'http' : 'none';
					/* eslint-enable no-nested-ternary */

					if (ext !== 'none' && header !== 'none') {
						cpEmbed.setImage(`${pastaContent.substring(pastaContent.indexOf(header), pastaContent.indexOf(ext))}${ext}`);
						pastaContent = pastaContent.substring(0, pastaContent.indexOf(header) - 1) + pastaContent.substring(pastaContent.indexOf(ext) + ext.length);
					}

					cpEmbed.setDescription(pastaContent);
					msg.delete();

					return msg.embed(cpEmbed);
				}
				msg.delete();

				return msg.say(pastaContent, {'split': true});
			}
		} catch (err) {
			this.deleteCommandMessages(msg);

			return msg.reply(`⚠️ that copypata does not exist! ${dymString}`);
		}
		this.deleteCommandMessages(msg);
		
		return msg.reply(`⚠️ that copypata does not exist! ${dymString}`);
	}
};