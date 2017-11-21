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
	path = require('path'),
	queue = require(path.join(__dirname, 'queue.js'));

module.exports = class listqueueCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'listqueue',
			'aliases': ['list', 'queue'],
			'group': 'music',
			'memberName': 'listqueue',
			'description': 'Returns of list of the current queue',
			'examples': ['listqueue'],
			'guildOnly': true,
			'throttling': {
				'usages': 1,
				'duration': 60
			}
		});
	}

	run (msg) {

		if (!queue[msg.guild.id]) {
			return msg.reply('The queue is empty. You can add songs with the `add` or `play` commands');
		}

		const queueEmbed = new Discord.MessageEmbed(),
			songQueue = queue[msg.guild.id].songs;

		queueEmbed
			.setColor('#E24141')
			.setAuthor(`Queue for ${msg.guild.name}`, msg.guild.iconURL())
			.addField('__Now Playing:__', `[${songQueue[0].title}](${songQueue[0].url}) | \`${songQueue[0].duration}\` | \`Requested By:\` ${songQueue[0].requester}`)
			.addField('⬇ __Up Next__ ⬇', 'tempdat', false);

		return msg.embed(queueEmbed);

	}
};