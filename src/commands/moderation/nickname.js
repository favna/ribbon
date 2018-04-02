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
 * Nickname a single member  
 * **Aliases**: `nick`
 * @module
 * @category moderation
 * @name nickname
 * @example nick Muffin Cupcake
 * @param {member} AnyMember Member to give a nickname
 * @param {string} NewNickname Nickname to assign
 * @returns {Message} Confirmation the nickname was assigned
 */

const {DiscordAPIError} = require('discord.js'),
  commando = require('discord.js-commando'),
  moment = require('moment'), 
  {deleteCommandMessages} = require('../../util.js'), 
  {oneLine, stripIndents} = require('common-tags');

module.exports = class nickCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'nickname',
      'memberName': 'nickname',
      'group': 'moderation',
      'aliases': ['nick'],
      'description': 'Assigns a nickname to a member. Use "clear" to remove the nickname',
      'format': 'MemberID|MemberName(partial or full) NewNickname|clear',
      'examples': ['nick favna pyrrha nikos'],
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'member',
          'prompt': 'Which member should I assign a nickname to?',
          'type': 'member'
        },
        {
          'key': 'nickname',
          'prompt': 'What nickname should I assign?',
          'type': 'string'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_NICKNAMES');
  }

  run (msg, args) {
    if (args.member.manageable) {
      try {
        if (args.nickname === 'clear') {
          args.member.setNickname('');
        } else {
          args.member.setNickname(args.nickname);
        }
      } catch (e) {
        if (e instanceof DiscordAPIError) {
          console.error(`	 ${stripIndents `An error occured on the AddRole command!
          Server: ${msg.guild.name} (${msg.guild.id})
          Author: ${msg.author.tag} (${msg.author.id})
          Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          Role: ${args.role.name} (${args.role.id})
          Error Message:`} ${e}`);
        } else {
          console.error('Unknown error occured in AddRole command');
        }
      }
    }
    deleteCommandMessages(msg, this.client);

    return msg.reply(oneLine `failed to set nickname to that member.
    Check that I have permission to set their nickname as well as the role hierarchy`);
  }
};