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
	superagent = require('superagent');

module.exports = class defineCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'define',
			'group': 'search',
			'aliases': ['def'],
			'memberName': 'define',
			'description': 'Gets the definition on a word on glosbe',
			'examples': ['define {word}', 'define pixel'],
			'guildOnly': false,

			'args': [
				{
					'key': 'query',
					'prompt': 'What word do you want to define?',
					'type': 'string',
					'label': 'Word to define'
				}
			]
		});
	}

	run (msg, args) {
		const defineEmbed = new Discord.MessageEmbed();

		superagent.get(`https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${args.query}`)
			.then(res => res.body)
			.then((res) => {
				if (!res.tuc) {
					return msg.reply('**No results found!**');
				}
				const final = [`**Definitions for __${args.query}__:**`];

				for (let [index, item] of Object.entries(res.tuc.filter(tuc => tuc.meanings)[0].meanings.slice(0, 5))) { // eslint-disable-line prefer-const

					item = item.text
						.replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '_')
						.replace(/&quot;/g, '"')
						.replace(/&#39;/g, '\'')
						.replace(/<b>/g, '[')
						.replace(/<\/b>/g, ']')
						.replace(/<i>|<\/i>/g, '_');
					final.push(`**${(parseInt(index, 10) + 1)}:** ${item}`);
				}
				defineEmbed
					.setColor('#FF0000')
					.setDescription(final);
				
				return msg.embed(defineEmbed);
			})
			.catch((err) => {
				console.error(err); // eslint-disable-line no-console

				return msg.reply('⚠️ No results found. An error was logged to your error console');
			});
	}
};