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
 * @file Owner CheckGuildsCommand - Lists all guilds the bot is in  
 * @module
 * @category owner
 * @name checkguilds 
 * @returns {Message} Amount and list of guilds in code blocks
 */

const {Command} = require('discord.js-commando'),
  {stripIndents} = require('common-tags');

module.exports = class CheckGuildsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'checkguilds',
      memberName: 'checkguilds',
      group: 'owner',
      description: 'Check the current guild count and their names',
      guildOnly: false,
      ownerOnly: true
    });
  }

  run (msg) {
    msg.say(stripIndents`\`\`\`The current guild count: ${this.client.guilds.size}
        
        Guild list:
        ${this.client.guilds.map(m => m.name).join('\n')}\`\`\``, {split: true});
  }
};