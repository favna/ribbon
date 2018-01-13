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
	cydia = require('cydia-api-node');

module.exports = class cydiaCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'cydia',
			'group': 'search',
			'aliases': ['cy'],
			'memberName': 'cydia',
			'description': 'Finds info on a Cydia package',
			'examples': ['cydia {packageName}', 'cydia anemone'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'query',
					'prompt': 'Which cydia package do you want to search?',
					'type': 'string',
					'label': 'Package name to look up'
				}
			]
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	async run (msg, args) {
		const cydiaEmbed = new Discord.MessageEmbed(),
			res = await cydia.getAllInfo(args.query);

		if (res) {
			cydiaEmbed
				.setColor('#E24141')
				.setAuthor('Tweak Info', 'http://i.imgur.com/OPZfdht.png')
				.addField('Display Name', res.display, true)
				.addField('Package Name', res.name, true)
				.addField('Description', res.summary, true)
				.addField('Version', res.version, true)
				.addField('Section', res.section, true)
				.addField('Price', res.price === 0 ? 'Free' : res.price, true)
				.addField('Link', `[Click Here](http://cydia.saurik.com/package/${res.name})`, true)
				.addField('Repo', `[${res.repo.name}](https://cydia.saurik.com/api/share#?source=${res.repo.link})`, true);

			this.deleteCommandMessages(msg);

			return msg.embed(cydiaEmbed);
		}

		this.deleteCommandMessages(msg);

		return msg.say(`**Tweak/Theme \`${args.query}\` not found!**`);
	}
};