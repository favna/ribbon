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

module.exports = class playCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'join',
			'group': 'music',
			'memberName': 'join',
			'description': 'Joins your voice channel',
			'examples': ['join'],
			'guildOnly': true,
			'throttling': {
				'usages': 1,
				'duration': 60
			}
		});
	}

	run (msg) {
		if (!msg.guild.voiceConnection) {
			if (!msg.member.voiceChannel) {
				return msg.reply('⚠️ You need to be in a voice channel before I can join you.');
			}

			if (!msg.member.voiceChannel.joinable) {
				return msg.reply('⚠️ I couldn\'t connect to your voice channel, check the permissions!');
			}
			
			return msg.member.voiceChannel.join()
				.then(connection => msg.say(`Jamming to my jukebox in ${msg.member.voiceChannel.name}`)); // eslint-disable-line no-unused-vars
		}
        
		return msg.reply('⚠️ An error occured while joining your channel, sorry 😢');
	}
};