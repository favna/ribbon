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

const Path = require('path'),
	commando = require('discord.js-commando'),
	queue = require(Path.join(__dirname, 'data.js')).queue;

module.exports = class skipCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'skip',
			'group': 'music',
			'memberName': 'skip',
			'description': 'Skips the currently playing song',
			'examples': ['skip'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 30
			}
		});
	}

	run (msg) {
		global.dispatcher.end('Skipped track');

		global.dispatcher.on('end', () => {
			queue[msg.guild.id].songs.shift();
			global.playSong(msg, queue[msg.guild.id].songs[0]);
		});
		msg.say('Skipped currently playing song');
	}
};