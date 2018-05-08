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
 * @file Moderation UnlockCommand - Unlock the channel  
 * Only really useful if you previously locked the channel  
 * Note that the bot does need to be able to be able to access this channel to unlock it (read permissions)  
 * **Aliases**: `delock`, `ul`
 * @module
 * @category moderation
 * @name unlock
 * @returns {Message} Confirmation the channel is unlocked
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class UnlockCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unlock',
      memberName: 'unlock',
      group: 'moderation',
      aliases: ['delock', 'ul'],
      description: 'Unlocks the current channel',
      examples: ['unlock'],
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
    const modlogsChannel = this.client.provider.get(msg.guild, 'modlogchannel',
        msg.guild.channels.exists('name', 'mod-logs')
          ? msg.guild.channels.find('name', 'mod-logs').id
          : null),
      overwrite = await msg.channel.overwritePermissions({
        overwrites: [
          {
            id: msg.guild.roles.find('name', lockrole === 'everyone' ? '@everyone' : lockrole.name).id,
            allowed: ['SEND_MESSAGES']
          }
        ],
        reason: 'Channel Lockdown'
      }),
      unlockEmbed = new MessageEmbed();

    unlockEmbed
      .setColor('#359876')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(oneLine`**Action:** 🔓 unlocked the \`${msg.channel.name}\` channel. 
				This channel can now be used by everyone again. Use \`${msg.guild.commandPrefix}lockdown\` in this channel to (re)-lock it.`)
      .setTimestamp();

    if (overwrite) {
      if (this.client.provider.get(msg.guild, 'modlogs', true)) {
        if (!this.client.provider.get(msg.guild, 'hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                            (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                            This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          this.client.provider.set(msg.guild, 'hasSentModLogMessage', true);
        }

        modlogsChannel ? msg.guild.channels.get(modlogsChannel).send('', {embed: unlockEmbed}) : null;
      }
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(unlockEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('an error occurred unlocking this channel');
  }
};