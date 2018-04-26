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
 * @file Info InviteCommand - Gets the invite link for the bot  
 * **Aliases**: `inv`, `links`, `shill`
 * @module
 * @category info
 * @name invite
 * @returns {MessageEmbed} Invite link along with other links
 */

const {MessageEmbed} = require('discord.js'), 
  {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invite',
      memberName: 'invite',
      group: 'info',
      aliases: ['inv', 'links', 'shill'],
      description: 'Gives you invitation links',
      examples: ['invite'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg) {
    startTyping(msg);
    const inviteEmbed = new MessageEmbed();

    inviteEmbed
      .setAuthor('Ribbon Links')
      .setThumbnail('https://favna.xyz/images/appIcons/ribbon.png')
      .setURL('https://favna.xyz/ribbon')
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .addField('​', ' [Add me to your server](https://discord.now.sh/376520643862331396?p8)\n' +
        '[Join the Support Server](https://discord.gg/zdt5yQt)\n' +
        '[Website](https://favna.xyz/ribbon)\n' +
        '[GitHub](https://github.com/Favna/Ribbon)\n' +
        '[Wiki](https://github.com/Favna/Ribbon/wiki)');

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(inviteEmbed, 'Find information on the bot here: https://favna.xyz/ribbon');
  }
};