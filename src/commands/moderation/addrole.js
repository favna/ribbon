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
 * @file Moderation AddRoleCommand - Add a role to member  
 * **Aliases**: `newrole`, `ar`
 * @module
 * @category moderation
 * @name addrole
 * @example addrole Favna Member
 * @param {member} AnyMember Member to give a role
 * @param {role} AnyRole Role to give
 * @returns {Message} Confirmation the role was added
 */

const moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class AddRoleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'addrole',
      memberName: 'addrole',
      group: 'moderation',
      aliases: ['newrole', 'ar'],
      description: 'Adds a role to a member',
      format: 'MemberID|MemberName(partial or full) RoleID|RoleName(partial or full)',
      examples: ['addrole favna testrole1'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I assign a role to?',
          type: 'member'
        },
        {
          key: 'role',
          prompt: 'What role should I add to that member?',
          type: 'role'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_ROLES');
  }

  async run (msg, {member, role}) {
    startTyping(msg);
    if (member.manageable) {
      try {
        const modlogChannel = this.client.provider.get(msg.guild, 'modlogchannel',
            msg.guild.channels.exists('name', 'mod-logs')
              ? msg.guild.channels.find('name', 'mod-logs').id
              : null),
          roleAdd = await member.roles.add(role),
          roleAddEmbed = new MessageEmbed();

        if (roleAdd) {
          roleAddEmbed
            .setColor('#AAEFE6')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`**Action:** Added ${role.name} to ${member.displayName}`)
            .setTimestamp();

          if (this.client.provider.get(msg.guild, 'modlogs', true)) {
            if (!this.client.provider.get(msg.guild, 'hasSentModLogMessage', false)) {
              msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
              this.client.provider.set(msg.guild, 'hasSentModLogMessage', true);
            }
            modlogChannel ? msg.guild.channels.get(modlogChannel).send({roleAddEmbed}) : null;
          }

          deleteCommandMessages(msg, this.client);
          stopTyping(msg);

          return msg.embed(roleAddEmbed);
        }
      } catch (err) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`addrole\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** \`${role.name} (${role.id})\` || \`${member.user.tag} (${member.id})\`
        **Error Message:** ${err}
        `);

        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
        Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`an error occurred adding the role \`${role.name}\` to \`${member.displayName}\`.
		Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
  }
};