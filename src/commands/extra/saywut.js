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
 * @file Extra SayWutCommand - Bust the last "say" user  
 * **Aliases**: `saywat`, `saywot`
 * @module
 * @category extra
 * @name saywut
 * @returns {MessageEmbed} Info on who used the "say" command last
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class SayWutCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'saywut',
      memberName: 'saywut',
      group: 'extra',
      aliases: ['saywat', 'saywot'],
      description: 'Bust the last "say" user',
      examples: ['saywut'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg) {
    startTyping(msg);
    const saydata = this.client.provider.get(msg.guild.id, 'saydata', null),
      wutEmbed = new MessageEmbed();

    if (saydata) {
      wutEmbed
        .setColor(saydata.memberHexColor)
        .setTitle(`Last ${saydata.commandPrefix}say message author`)
        .setAuthor(oneLine`${saydata.authorTag} (${saydata.authorID})`, saydata.avatarURL)
        .setDescription(saydata.argString)
        .setTimestamp();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(wutEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`couldn't fetch message for your server. Has anyone used the ${msg.guild.commandPrefix}say command before?`);
  }
};