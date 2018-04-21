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
 * @file Moderation defaultroleCommand - Sets a default role that should be assigned to all new joining members  
 * **Aliases**: `defrole`
 * @module
 * @category moderation
 * @name defaultrole
 * @example defaultrole Member
 * @param {role} AnyRole Role to assign to all new joining members
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class defaultroleCommand extends Command {
  constructor (client) {
    super(client, {
      'name': 'defaultrole',
      'memberName': 'defaultrole',
      'group': 'moderation',
      'aliases': ['defrole'],
      'description': 'Set a default role the bot will assign to any members joining after this command',
      'details': 'Use "delete" to remove the default role',
      'format': 'RoleID|RoleName(partial or full)',
      'examples': ['defaultrole Member'],
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'role',
          'prompt': 'Which role would you like to set as the default role?',
          'type': 'role',
          'default': 'delete'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, args) {
    startTyping(msg);
    if (args.role === 'delete') {
      this.client.provider.remove(msg.guild.id, 'defaultRole');
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('🔒 Default role has been removed');
    }

    this.client.provider.set(msg.guild.id, 'defaultRole', args.role.id);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`🔓 \`${args.role.name}\` has been set as the default role for this server and will now be granted to all people joining.
        Use \`${msg.guild.commandPrefix}defaultrole delete\` to remove this setting.`);
  }
};