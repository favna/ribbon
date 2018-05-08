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
 * @file Moderation LockdownCommand - Lockdown a channel  
 * NOTE: Once locked it will be locked to the `@everyone` role and depending on your permissions setup it may be that only people with the `administrator` role will have access to the channel.
 * This may also mean that the bot won't have access if it doesn't have administrator role so you cannot use the `unlock` command until you give it that permission!  
 * **Aliases**: `lock`, `ld`
 * @module
 * @category moderation
 * @name lockdown
 * @returns {Message} Confirmation the channel was locked
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class LockdownCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lockdown',
      memberName: 'lockdown',
      group: 'moderation',
      aliases: ['lock', 'ld'],
      description: 'Locks the current channel to just staff',
      examples: ['lockdown'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'lockrole',
          prompt: 'Which role to apply the lockdown to?',
          type: 'role',
          default: 'everyone'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  async run (msg, {lockrole}) {
    startTyping(msg);
    const lockEmbed = new MessageEmbed(),
      modlogChannel = this.client.provider.get(msg.guild, 'modlogchannel',
        msg.guild.channels.exists('name', 'mod-logs')
          ? msg.guild.channels.find('name', 'mod-logs').id
          : null),
      overwrite = await msg.channel.overwritePermissions({
        overwrites: [
          {
            id: msg.member.roles.highest.id,
            allowed: ['SEND_MESSAGES', 'VIEW_CHANNEL']
          },
          {
            id: msg.guild.roles.find('name', lockrole === 'everyone' ? '@everyone' : lockrole.name).id,
            denied: ['SEND_MESSAGES']
          }
        ],
        reason: 'Channel Lockdown'
      });

    lockEmbed
      .setColor('#983553')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Action:** 🔒 locked the \`${msg.channel.name}\` channel.
      **Details:** Only staff can now access this channel. Use \`${msg.guild.commandPrefix}unlock\` in this channel to unlock the channel`)
      .setTimestamp();

    if (overwrite) {
      if (this.client.provider.get(msg.guild, 'modlogs', true)) {
        if (!this.client.provider.get(msg.guild, 'hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                            (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                            This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          this.client.provider.set(msg.guild, 'hasSentModLogMessage', true);
        }
        modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: lockEmbed}) : null;
      }
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(lockEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('an error occurred locking this channel');
  }
};