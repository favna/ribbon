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
 * @file Moderation BanCommand - Ban a bad member  
 * **Aliases**: `b`, `banana`
 * @module
 * @category moderation
 * @name ban
 * @example ban MultiMegaMander
 * @param {GuildMemberResolvable} AnyMember The member to ban from the server
 * @param {StringResolvable} [TheReason] Reason for this banishment. Include `--no-delete` anywhere in the reason to prevent the bot from deleting the banned member's messages
 * @returns {MessageEmbed} Log of the ban
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class banCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      memberName: 'ban',
      group: 'moderation',
      aliases: ['b', 'banana'],
      description: 'Bans a member from the server',
      format: 'MemberID|MemberName(partial or full) [ReasonForBanning]',
      examples: ['ban JohnDoe annoying'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I ban?',
          type: 'member'
        },
        {
          key: 'reason',
          prompt: 'What is the reason for this banishment?',
          type: 'string',
          default: ''
        }
      ]
    });

    this.regex = /--nodelete/im;
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('BAN_MEMBERS');
  }

  run (msg, {member, reason, keepmessages}) {
    startTyping(msg);
    if (member.id === msg.author.id) {
      stopTyping(msg);

      return msg.reply('I don\'t think you want to ban yourself.');
    }

    if (!member.bannable) {
      stopTyping(msg);

      return msg.reply('I cannot ban that member, their role is probably higher than my own!');
    }

    if (this.regex.test(msg.argString)) {
      reason = reason.substring(0, reason.indexOf('--nodelete')) + reason.substring(reason.indexOf('--nodelete') + '--nodelete'.length + 1);
      keepmessages = true;
    }

    member.ban({
      days: keepmessages ? 0 : 1,
      reason: reason !== '' ? reason : 'No reason given by staff'
    });

    const banEmbed = new MessageEmbed(),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null);

    banEmbed
      .setColor('#FF1900')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Member:** ${member.user.tag} (${member.id})
      **Action:** Ban
      **Reason:** ${reason !== '' ? reason : 'No reason given by staff'}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
					(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
					This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: banEmbed}) : null;
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(banEmbed);
  }
};