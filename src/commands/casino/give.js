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
 * reasonable ways as different from the original version.
 */

/**
 * @file Casino GiveCommand - Give another player some chips  
 * **Aliases**: `donate`
 * @module
 * @category casino
 * @name give
 * @example give Favna 10
 * @param {member} AnyMember The member you want to give some chips
 * @param {number} ChipsAmount The amount of chips you want to give
 * @returns {MessageEmbed} Changed balances of the two players
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class GiveCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'give',
      memberName: 'give',
      group: 'casino',
      aliases: ['donate'],
      description: 'Give another player some chips',
      format: 'AnyMember ChipsAmount',
      examples: ['give GuyInShroomSuit 50'],
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
        },
        {
          key: 'chips',
          prompt: 'How many chips do you want to give?',
          type: 'integer',
          validate: (chips) => {
            if (/^[+]?\d+$/.test(chips) && chips >= 1 && chips <= 10000) {
              return true;
            }

            return 'Reply with a chips amount has to be a full number (no decimals) between 1 and 10000. Example: `10`';
          }
        }
      ]
    });
  }

  run (msg, args) {
    const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3')),
      giveEmbed = new MessageEmbed();

    giveEmbed
      .setTitle('Transaction Log')
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = $authorid OR userID = $playerid;`).all({
        authorid: msg.author.id,
        playerid: args.player.id
      });

      if (query.length !== 2) {
        return msg.reply(`looks like either you or the person you want to donate to has no balance yet. Use \`${msg.guild.commandPrefix}chips\` to get some`);
      }

      let giverEntry = 0,
        receiverEntry = 0;

      for (const row in query) {
        if (query[row].userID === msg.author.id) {
          giverEntry = row;
        }
        if (query[row].userID === args.player.id) {
          receiverEntry = row;
        }
      }

      const oldGiverBalance = query[giverEntry].balance, // eslint-disable-line one-var
        oldReceiverEntry = query[receiverEntry].balance;

      query[giverEntry].balance -= args.chips;
      query[receiverEntry].balance += args.chips;

      conn.prepare(`UPDATE "${msg.guild.id}" SET balance=? WHERE userID=?;`).run(query[giverEntry].balance, query[giverEntry].userID);
      conn.prepare(`UPDATE "${msg.guild.id}" SET balance=? WHERE userID=?;`).run(query[receiverEntry].balance, query[receiverEntry].userID);

      giveEmbed
        .addField(msg.member.displayName, `${oldGiverBalance} ➡ ${query[giverEntry].balance}`)
        .addField(args.player.displayName, `${oldReceiverEntry} ➡ ${query[receiverEntry].balance}`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(giveEmbed);

    } catch (err) {
      stopTyping(msg);
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`give\` command!
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