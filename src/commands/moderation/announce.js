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

const commando = require('discord.js-commando');

module.exports = class newsCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'announce',
			'group': 'moderation',
			'aliases': ['news'],
			'memberName': 'announce',
			'description': 'Make an announcement in the news channel',
			'examples': ['announce John Appleseed reads the news'],
			'guildOnly': true,
			'throttling': {
				'usages': 1,
				'duration': 60
			},

			'args': [
				{
					'key': 'body',
					'prompt': 'What do you want me to announce?',
					'type': 'string'
				}
			]
		});
	}

	hasPermission (msg) {
		return msg.member.hasPermission('ADMINISTRATOR');
	}

	run (msg, args) {
		if (msg.guild.channels.exists('name', 'announcements') || msg.guild.channels.exists('name', 'news')) {
			const newsChannel = msg.guild.channels.exists('name', 'announcements') ? msg.guild.channels.find('name', 'announcements') : msg.guild.channels.find('name', 'news');

			let announce = args.body;

			announce.slice(0, 4) !== 'http' ? announce = `${args.body.slice(0, 1).toUpperCase()}${args.body.slice(1)}` : null;
			msg.attachments.first() && msg.attachments.first().url ? announce += `\n${msg.attachments.first().url}` : null;

			return newsChannel.send(announce);
		}

		return msg.reply('To use the announce command you need a channel named \'news\' or \'announcements\'');
	}
};