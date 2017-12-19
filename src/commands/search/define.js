/*
 *   This file is part of discord-self-bot
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
 */

const Discord = require('discord.js'),
	commando = require('discord.js-commando'),
	request = require('snekfetch');

module.exports = class defineCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'define',
			'group': 'search',
			'aliases': ['def', 'dict'],
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

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	async run (msg, args) {
		const defineEmbed = new Discord.MessageEmbed(),
			word = await request.get(`https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${args.query}`);

		if (word.body.tuc) {
			const final = [`**Definitions for __${args.query}__:**`];

			for (let [index, item] of Object.entries(word.body.tuc.filter(tuc => tuc.meanings)[0].meanings.slice(0, 5))) { // eslint-disable-line prefer-const

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
				.setColor('#E24141')
				.setDescription(final);

			this.deleteCommandMessages(msg);
			
			return msg.embed(defineEmbed);
		}

		this.deleteCommandMessages(msg);

		return msg.reply('⚠️ ***nothing found***');
	}
};