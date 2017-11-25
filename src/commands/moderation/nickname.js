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

module.exports = class nickCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'nickname',
			'group': 'moderation',
			'aliases': ['nick'],
			'memberName': 'nickname',
			'description': 'Assigns a nickname to a member. Use "clear" to remove the nickname',
			'examples': ['nick {user} {nickname}', 'nick favna pyrrha nikos'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 10
			},

			'args': [
				{
					'key': 'member',
					'prompt': 'Assign a nickname to which member?',
					'type': 'member'
				},
				{
					'key': 'nickname',
					'prompt': 'What nickname to assign?',
					'type': 'string'
				}
			]
		});
	}

	hasPermission (msg) {
		return msg.member.hasPermission('MANAGE_NICKNAMES');
	}

	run (msg, args) {
		return args.nickname !== 'clear'
			? args.member.setNickname(args.nickname)
				.then(() => msg.say(`Nickname \`${args.nickname}\` has been assigned to \`${args.member.user.username}\``),
					() => msg.reply('⚠️️ Failed to nickname member, do I have nickname managing permission?'))
			: args.member.setNickname('')
				.then(() => msg.say(`Nickname has been removed from \`${args.member.displayName}\``),
					() => msg.reply('⚠️️ Failed to nickname member, do I have nickname managing permission?'));
	}
};