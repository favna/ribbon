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

module.exports = class delRoleCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'delrole',
			'group': 'moderation',
			'aliases': ['deleterole', 'dr', 'remrole', 'removerole'],
			'memberName': 'delrole',
			'description': 'Deletes a role from a member',
			'examples': ['delrole {member} {role}'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'member',
					'prompt': 'Who should get a role removed?',
					'type': 'member'
				},
				{
					'key': 'role',
					'prompt': 'What role should I remove?',
					'type': 'role'
				}
			]
		});
	}

	hasPermission (msg) {
		return msg.member.hasPermission('MANAGE_ROLES');
	}

	async run (msg, args) {
		await args.member.removeRole(args.role).then(() => msg.say(`\`${args.role.name}\` removed from \`${args.member.displayName}\``), () => msg.reply('Error'));
	}
};