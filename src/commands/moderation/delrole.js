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

const {DiscordAPIError} = require('discord.js'),
  commando = require('discord.js-commando'),
  moment = require('moment'), 
  {deleteCommandMessages} = require('../../util.js'), 
  {oneLine, stripIndents} = require('common-tags');

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

  async run (msg, args) {
    if (args.member.manageable) {
      try {
        const roleAdd = await args.member.roles.remove(args.role);

        if (roleAdd) {
          deleteCommandMessages(msg, this.client);

          return msg.reply(`\`${args.role.name}\` remove from \`${args.member.displayName}\``);
        }
      } catch (e) {
        if (e instanceof DiscordAPIError) {
          console.error(`	 ${stripIndents `An error occured on the DeleteRole command!
				Server: ${msg.guild.name} (${msg.guild.id})
				Author: ${msg.author.tag} (${msg.author.id})
				Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
				Role: ${args.role.name} (${args.role.id})
				Error Message:`} ${e}`);
        } else {
          console.error('Unknown error occured in DeleteRole command');
        }
      }
    }
    deleteCommandMessages(msg, this.client);

    return msg.reply(oneLine `an error occured removing the role \`${args.role.name}\` from \`${args.member.displayName}\`.
		Do I have \`Manage Roles\` permission and am I hierarchly high enough for modifying their roles?`);
  }
};