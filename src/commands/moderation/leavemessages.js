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
 * @file Moderation LeaveMessagesCommand - Toggle whether Ribbon should send special leave messages when members leave
 * **Aliases**: `lmt`, `leavemessagestoggle`
 * @module
 * @category moderation
 * @name leavemessages
 * @example leavemessages enable
 * @param {boolean} Option True or False
 * @returns {MessageEmbed} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class LeaveMessagesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'leavemessages',
      memberName: 'leavemessages',
      group: 'moderation',
      aliases: ['lmt', 'leavemessagestoggle'],
      description: 'Toggle whether Ribbon should send special leave messages when members leave',
      format: 'Enable|Disable',
      examples: ['leavemessages enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable leave messages?',
          type: 'boolean',
          validate: (bool) => {
            const validBools = ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+', 'false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-'];

            if (validBools.includes(bool.toLowerCase())) {
              return true;
            }

            return `Has to be one of ${validBools.join(', ')}`;
          }
        },
        {
          key: 'channel',
          prompt: 'In which channel should I wave people goodbye?',
          type: 'channel',
          default: 'off'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, {channel, option}) {
    if (option && channel === 'off') {
      return msg.reply('when activating join messages you need to provide a channel for me to output the messages to!');
    }

    startTyping(msg);
    const defRoleEmbed = new MessageEmbed(),
      description = option ? '📉 Ribbon leave messages have been enabled' : '📉 Ribbon leave messages have been disabled',
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.exists('name', 'mod-logs')
          ? msg.guild.channels.find('name', 'mod-logs').id
          : null);
    
    msg.guild.settings.set('leavemsgs', option);
    msg.guild.settings.set('leavemsgchannel', channel.id);

    defRoleEmbed
      .setColor('#AAEFE6')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
        **Action:** ${description}
        ${option ? `**Channel:** <#${channel.id}>` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get(msg.guild, 'modlogs', true)) {
      if (!msg.guild.settings.get(msg.guild, 'hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                      (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                      This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set(msg.guild, 'hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: defRoleEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(defRoleEmbed);
  }
};