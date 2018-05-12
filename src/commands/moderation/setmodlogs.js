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
 * @file Moderation SetModlogsCommand - Sets the channel used for mod logs  
 * **Aliases**: `setmod`
 * @module
 * @category moderation
 * @name setmodlogs
 * @example setmodlogs logs
 * @param {ChannelResolvable} LogChannel The channel to use for mod logs
 * @returns {MessageEmbed} Setmodlogs confirmation log
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class SetModlogsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'setmodlogs',
      memberName: 'setmodlogs',
      group: 'moderation',
      aliases: ['setmod'],
      description: 'Set the modlogs channel used for logging mod commands. Ensure to enable modlogs with the "modlogs" command.',
      format: 'ChannelID|ChannelName(partial or full)',
      examples: ['setmodlogs mod-logs'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'channel',
          prompt: 'What channel should I set for member logs? (make sure to start with a # when going by name)',
          type: 'channel'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, {channel}) {
    startTyping(msg);

    const modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.exists('name', 'mod-logs')
          ? msg.guild.channels.find('name', 'mod-logs').id
          : null),
      setModLogsEmbed = new MessageEmbed();

    msg.guild.settings.set('modlogchannel', channel.id);

    setModLogsEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
  **Action:** Mod logs channel changed
  **Channel:** <#${channel.id}>
  `)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                  (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                  This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: setModLogsEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(setModLogsEmbed);
  }
};