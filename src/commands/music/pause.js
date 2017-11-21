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
	dispatcher = require(Path.join(__dirname, 'data.js')).dispatcher,
	queue = require(Path.join(__dirname, 'data.js')).queue;


module.exports = class pauseCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'pause',
			'aliases': ['halt', 'hush'],
			'group': 'music',
			'memberName': 'pause',
			'description': 'Pauses the currently playing song',
			'examples': ['pause'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 30
			}
		});
	}

	run (msg) {
		if (!dispatcher.paused) {
			queue[msg.guild.id].playing = false;

			return dispatcher.pause();
		}

		if (!queue[msg.guild.id].playing) {
			return msg.say('I\'m not currently playing music');
		}

		return msg.say('This command has no use until I am playing music!');
	}
};