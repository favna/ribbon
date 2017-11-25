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

module.exports = class disconnectCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'disconnect',
			'aliases': ['stop', 'quit', 'leave'],
			'group': 'music',
			'memberName': 'disconnect',
			'description': 'Disconnects the bot from the voice channel',
			'examples': ['disconnect'],
			'guildOnly': true,
			'throttling': {
				'usages': 1,
				'duration': 60
			}
		});
	}

	run (msg) {
		if (!msg.guild.voiceConnection) {
			return msg.reply('⚠️ I\'m not in a voice channel I can disconnect from!');
		}

		const VoiceChannel = msg.guild.voiceConnection.channel;

		queue[msg.guild.id].playing = false;
		global.dispatcher.end();
		VoiceChannel.leave();
		
		return msg.reply(`Left the ${VoiceChannel.name} voice channel`);
	}
};