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

module.exports = class playCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'play',
			'aliases': ['start'],
			'group': 'music',
			'memberName': 'play',
			'description': 'Add a song to your queue and start playing. Also auto-joins your voice channel',
			'examples': ['play {URL}', 'play https://www.youtube.com/watch?v=aatr_2MstrI'],
			'guildOnly': true,
			'throttling': {
				'usages': 1,
				'duration': 60
			}
		});
	}

	run(msg) { // eslint-disable-line
		if (!msg.guild.voiceConnection) {
			if (!msg.member.voiceChannel.joinable) {
				return msg.reply('I couldn\'t connect to your voice channel. If you are not yet in any voice channel please join one first.');
			}
			msg.member.voiceChannel.join();
			msg.say(`Jamming to my jukebox in ${msg.member.voiceChannel.name}`); // eslint-disable-line no-unused-vars
		}
		
		if (!queue[msg.guild.id]) {
			return msg.say('You need to queue up some songs with the `add` command before I can play them');
		}

		if (queue[msg.guild.id].playing) {
			return msg.say('🎵 Already playing music 🎵');
		}
		const song = queue[msg.guild.id].songs[0];

		global.playSong(msg, song);
		global.endStream(msg);
		global.errStream(msg);
	}
};