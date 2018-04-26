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
 * @file Owner TagMemberCommand - Tags a member by ID  
 * Primarily meant for mobile and when members have annoying untaggable names  
 * @module
 * @category owner
 * @name tagmember
 * @example tagmember ☜(⌒▽⌒)☞guy
 * @param {member} AnyMember Member to make a mention to
 * @returns {Message} Mention of the member wrapped between carets
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class TagMemberCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tagmember',
      memberName: 'tagmember',
      group: 'owner',
      description: 'Tag a member',
      format: 'MemberID|MemberName(partial or full)',
      examples: ['tagmember Favna'],
      guildOnly: false,
      ownerOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'What user would you like to snoop on?',
          type: 'member'
        }
      ]
    });
  }

  run (msg, args) {
    startTyping(msg);
    deleteCommandMessages(msg, this.client);
    msg.say(`^^^^ <@${args.member.id}> ^^^^`);

    return stopTyping(msg);
  }
};