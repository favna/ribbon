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

/**
 * Delete the role of a member  
 * **Aliases**: `deleterole`, `dr`, `remrole`, `removerole`
 * @module
 * @category moderation
 * @name delrole
 * @example delrole Favna Member
 * @param {member} AnyMember The member to remove a role from
 * @param {role} AnyRole The role to remove
 * @returns {Message} Confirmation the role was removed
 */

const commando = require('discord.js-commando'),
	{deleteCommandMessages} = require('../../util.js');

module.exports = class delRoleCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'delrole',
			'memberName': 'delrole',
			'group': 'moderation',
			'aliases': ['deleterole', 'dr', 'remrole', 'removerole'],
			'description': 'Deletes a role from a member',
			'format': 'MemberID|MemberName(partial or full) RoleID|RoleName(partial or full)',
			'examples': ['delrole {member} {role}'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'member',
					'prompt': 'Which member should I remove a role from?',
					'type': 'member'
				},
				{
					'key': 'role',
					'prompt': 'What role should I remove from that member?',
					'type': 'role'
				}
			]
		});
	}

	hasPermission (msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_ROLES');
	}

	run (msg, args) {
		deleteCommandMessages(msg, this.client);

		return args.member.roles.remove(args.role).then(() => msg.say(`\`${args.role.name}\` removed from \`${args.member.displayName}\``), () => msg.reply('Error'));
	}
};