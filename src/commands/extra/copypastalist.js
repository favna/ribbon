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
 * @file Extra CopyPastaListCommand - Gets all copypastas available to the server  
 * **Aliases**: `cplist`, `copylist`, `pastalist`
 * @module
 * @category extra
 * @name copypastalist
 * @returns {MessageEmbed} List of all available copypastas
 */

const fs = require('fs'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {splitMessage} = require('discord.js'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class CopyPastaListCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'copypastalist',
      memberName: 'copypastalist',
      group: 'extra',
      aliases: ['cplist', 'copylist', 'pastalist'],
      description: 'Gets all copypastas available to the server',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run (msg) {
    try {
      startTyping(msg);
      const list = fs.readdirSync(path.join(__dirname, `../../data/pastas/${msg.guild.id}`));

      if (list && list.length) {
        for (const entry in list) {
          list[entry] = `- \`${list[entry].slice(0, -4)}\``;
        }
      }

      deleteCommandMessages(msg, this.client);

      if (list.join('\n').length >= 2000) {
        const messages = [],
          splitTotal = splitMessage(stripIndents`${list.join('\n')}`);

        for (const part in splitTotal) {
          messages.push(await msg.embed({
            title: 'Copypastas available on this server',
            description: splitTotal[part],
            color: msg.guild.me.displayColor
          }));
        }
        stopTyping(msg);

        return messages;
      }

      stopTyping(msg);

      return msg.embed({
        title: 'Copypastas available on this server',
        description: list.join('\n'),
        color: msg.guild.me.displayColor
      });

    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`copypastalist\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(`no copypastas found for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd\`!`);
    }
  }
};