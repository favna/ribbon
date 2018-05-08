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
 * @file Moderation NickCommand - Nickname a single member  
 * **Aliases**: `nick`
 * @module
 * @category moderation
 * @name nickname
 * @example nick Muffin Cupcake
 * @param {member} AnyMember Member to give a nickname
 * @param {string} NewNickname Nickname to assign
 * @returns {Message} Confirmation the nickname was assigned
 */

const moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {oneLine, stripIndents} = require('common-tags'),  
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class NickCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'nickname',
      memberName: 'nickname',
      group: 'moderation',
      aliases: ['nick'],
      description: 'Assigns a nickname to a member. Use "clear" to remove the nickname',
      format: 'MemberID|MemberName(partial or full) NewNickname|clear',
      examples: ['nick favna pyrrha nikos'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I assign a nickname to?',
          type: 'member'
        },
        {
          key: 'nickname',
          prompt: 'What nickname should I assign?',
          type: 'string'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_NICKNAMES');
  }

  run (msg, {member, nickname}) {
    startTyping(msg);
    if (member.manageable) {
      try {
        if (nickname === 'clear') {
          member.setNickname('');
        } else {
          member.setNickname(nickname);
        }
        stopTyping(msg);

        return msg.reply(`${nickname === 'clear' ? `removed <@${member.id}>'s nickname` : `assigned \`${nickname}\` as nickname to <@${member.id}>`}`);
      } catch (err) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`nickname\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** \`${member.user.tag} (${member.id})\` || \`${nickname}\`
        **Error Message:** ${err}
        `);
  
        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
        Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`failed to set nickname to that member.
    Check that I have permission to set their nickname as well as the role hierarchy`);
  }
};