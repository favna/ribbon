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
 * @file Streamwatch TwitchOutputCommand - Configures the channel in which twitch notifications are send  
 * **Aliases**: `output`, `twitchout`, `twitchchannel`
 * @module
 * @category streamwatch
 * @name twitchoutput
 * @example twitchoutput #twitch-notifications
 * @param {channel} AnyChannel Channel to output notifs to
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {oneLine} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class TwitchOutputCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'twitchoutput',
      memberName: 'twitchoutput',
      group: 'streamwatch',
      aliases: ['output', 'twitchout', 'twitchchannel'],
      description: 'Configures where Twitch Notifications are send to',
      format: 'ChannelID|ChannelName(partial or full)',
      examples: ['twitchoutput twitch'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'channel',
          prompt: 'What channel should I set for twitch notifications? (make sure to start with a # when going by name)',
          type: 'channel'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, args) {
    startTyping(msg);
    this.client.provider.set(msg.guild.id, 'twitchchannel', args.channel.id);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`📹 the channel to use for the twitch notifications has been set to <#${args.channel.id}>`);
  }
};