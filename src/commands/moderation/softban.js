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
 * @file Moderation SoftbanCommand - Bans a member deleting their messages and then unbans them allowing them to rejoin (no invite link is shared)  
 * This is essentially a kick with the added effect of deleting all their past messages from the last 24 hours  
 * **Aliases**: `sb`, `sban`
 * @module
 * @category moderation
 * @name softban
 * @example softban ImmortalZypther
 * @param {member} AnyMember The member to softban from the server
 * @param {string} TheReason Reason for this softban.
 * @returns {MessageEmbed} A MessageEmbed with a log of the softban
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class SoftbanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'softban',
      memberName: 'softban',
      group: 'moderation',
      aliases: ['sb', 'sban'],
      description: 'Kicks a member while also purging messages from the last 24 hours',
      format: 'MemberID|MemberName(partial or full) [ReasonForSoftbanning]',
      examples: ['softban JohnDoe annoying'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I softban?',
          type: 'member'
        },
        {
          key: 'reason',
          prompt: 'What is the reason for this softban?',
          type: 'string'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('BAN_MEMBERS');
  }

  run (msg, args) {
    startTyping(msg);
    if (args.member.id === msg.author.id) {
      stopTyping(msg);

      return msg.reply('I don\'t think you want to softban yourself.');
    }

    if (!args.member.bannable) {
      stopTyping(msg);

      return msg.reply('I cannot softban that member, their role is probably higher than my own!');
    }

    args.member.ban({
      days: 1,
      reason: args.reason
    });

    msg.guild.members.unban(args.member.user);

    const modlogsChannel = this.client.provider.get(msg.guild, 'modlogchannel',
        msg.guild.channels.exists('name', 'mod-logs')
          ? msg.guild.channels.find('name', 'mod-logs').id
          : null),
      softbanEmbed = new MessageEmbed();

    softbanEmbed
      .setColor('#FF8300')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Member:** ${args.member.user.tag} (${args.member.id})
      **Action:** Softban
      **Reason:** ${args.reason}`)
      .setTimestamp();

    if (this.client.provider.get(msg.guild, 'modlogs', true)) {
      if (!this.client.provider.get(msg.guild, 'hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
					(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
					This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        this.client.provider.set(msg.guild, 'hasSentModLogMessage', true);
      }

      modlogsChannel ? msg.guild.channels.get(modlogsChannel).send({softbanEmbed}) : null;
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(softbanEmbed);
  }
};