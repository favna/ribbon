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
 * @file Casino MemberBalanceCommand - Retrieves the amount of chips another member has for the casino  
 * **Aliases**: `mbal`, `mcash`, `mbalance`, `mchips`
 * @module
 * @category casino
 * @name memberbalance
 * @example mchips Sagiri
 * @param {Member} AnyMember Member to get the balance for
 * @returns {MessageEmbed} Information about the current balance of the member
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class MemberBalanceCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'memberbalance',
      memberName: 'memberbalance',
      group: 'casino',
      aliases: ['mbal', 'mcash', 'mbalance', 'mchips'],
      description: 'Retrieves the amount of chips another member has for the casino',
      format: 'MemberID|MemberName(partial or full)',
      examples: ['memberbalance Sagiri'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'player',
          prompt: 'Which player should I give them to?',
          type: 'member'
        }
      ]
    });
  }

  run (msg, args) {
    const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3')),
      mbalEmbed = new MessageEmbed();

    mbalEmbed
      .setAuthor(args.player.displayName, args.player.user.displayAvatarURL({format: 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`).get(args.player.id);

      if (query) {
        mbalEmbed.setDescription(stripIndents`
        **Balance**
        ${query.balance}`);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(mbalEmbed);
      }
      stopTyping(msg);

      return msg.reply(`looks like ${args.player.displayName} doesn\'t have any chips yet. When they run \`${msg.guild.commandPrefix}chips\` they will get their first 500`);
    } catch (err) {
      stopTyping(msg);
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`memberbalance\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};