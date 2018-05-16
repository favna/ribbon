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
 * @file Info UserInfoCommand - Get the info from a user  
 * **Aliases**: `user`, `uinfo`
 * @module
 * @category info
 * @name userinfo
 * @example userinfo Favna
 * @param {GuildMemberResolvable} AnyMember Member you want to get info about
 * @returns {MessageEmbed} Info about that member
 */

const moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {arrayClean, capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class UserInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'userinfo',
      memberName: 'userinfo',
      group: 'info',
      aliases: ['user', 'uinfo'],
      description: 'Gets information about a user.',
      format: 'MemberID|MemberName(partial or full)',
      examples: ['uinfo Favna'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'What user would you like to snoop on?',
          type: 'member'
        }
      ]
    });
  }

  run (msg, {member}) {
    startTyping(msg);

    const uinfoEmbed = new MessageEmbed();

    uinfoEmbed
      .setAuthor(member.user.tag)
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(member.displayHexColor)
      .addField('ID', member.id, true)
      .addField('Name', member.user.username, true)
      .addField('Nickname', member.nickname ? member.nickname : 'No Nickname', true)
      .addField('Status', member.user.presence.status !== 'dnd' ? capitalizeFirstLetter(member.user.presence.status) : 'Do Not Disturb', true)
      .addField(member.user.presence.activity ? capitalizeFirstLetter(member.user.presence.activity.type) : 'Activity',
        member.user.presence.activity ? member.user.presence.activity.name : 'Nothing', true)
      .addField('Display Color', member.displayHexColor, true)
      .addField('Role(s)', member.roles.size > 1 ? arrayClean(null, member.roles.map((r) => {
        if (r.name !== '@everyone') {
          return r.name;
        }

        return null;
      })).join(' | ') : 'None', false)
      .addField('Account created at', moment(member.user.createdAt).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'), true)
      .addField('Joined server at', moment(member.joinedAt).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'), true);
    member.roles.size >= 1 ? uinfoEmbed.setFooter(`${member.displayName} has ${member.roles.size - 1} role(s)`) : uinfoEmbed.setFooter(`${member.displayName} has 0 roles`);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    msg.embed(uinfoEmbed);
  }
};