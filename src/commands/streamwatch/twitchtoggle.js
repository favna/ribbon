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
 * @file Streamwatch TwitchToggleCommand - Killswitch for Twitch notifications  
 * **Aliases**: `twitchcon`, `twitchoff`
 * @module
 * @category streamwatch
 * @name twitchtoggle
 * @example twitchtoggle enable
 * @param {boolean} Option True or False
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {oneLine} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class TwitchToggleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'twitchtoggle',
      memberName: 'twitchtoggle',
      group: 'streamwatch',
      aliases: ['twitchon', 'twitchoff'],
      description: 'Configures whether Twitch Notifications are enabled',
      details: 'This is a killswitch for the entire module!',
      format: 'Enable|Disable',
      examples: ['twitchtoggle enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable twitchtoggles?',
          type: 'boolean',
          validate: (bool) => {
            const validBools = ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+', 'false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-'];

            if (validBools.includes(bool.toLowerCase())) {
              return true;
            }

            return `Has to be one of ${validBools.join(', ')}`;
          }
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
  }

  run (msg, args) {
    startTyping(msg);
    this.client.provider.set(msg.guild.id, 'twitchnotifiers', args.option);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`Twitch Notifiers have been
    ${args.option 
    ? `enabled.
        Please make sure to set the output channel with \`${msg.guild.commandPrefix}twitchoutput\`
        and configure which users to monitor with \`${msg.guild.commandPrefix}twitchmonitors\` ` 
    : 'disabled.'}.`);
  }
};