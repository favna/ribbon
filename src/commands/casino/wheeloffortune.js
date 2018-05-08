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
 * @file Casino WheelOfFortuneCommand - Gamble your chips at the wheel of fortune  
 * **Aliases**: `wheel`, `wof`
 * @module
 * @category casino
 * @name wheeloffortune
 * @example wof 5
 * @param {number} ChipsAmount The amount of chips you want to gamble
 * @returns {MessageEmbed} Outcome of the game
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, roundNumber, stopTyping, startTyping} = require('../../util.js');

module.exports = class WheelOfFortuneCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'wheeloffortune',
      memberName: 'wheeloffortune',
      group: 'casino',
      aliases: ['wheel', 'wof'],
      description: 'Gamble your chips iat the wheel of fortune',
      format: 'AmountOfChips',
      examples: ['wof 50'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'chips',
          prompt: 'How many chips do you want to gamble?',
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
    const arrowmojis = ['⬆', '↖', '⬅', '↙', '⬇', '↘', '➡', '↗'],
      conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3')),
      multipliers = ['0.1', '0.2', '0.3', '0.5', '1.2', '1.5', '1.7', '2.4'],
      spin = Math.floor(Math.random() * multipliers.length),
      wofEmbed = new MessageEmbed();

    wofEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({format: 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

      if (query) {
        if (args.chips > query.balance) {
          return msg.reply(`you don\'t have enough chips to make that bet. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
        }

        const prevBal = query.balance;

        query.balance -= args.chips;
        query.balance += args.chips * multipliers[spin];
        query.balance = roundNumber(query.balance);

        conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${msg.author.id}";`).run({balance: query.balance});

        wofEmbed
          .setTitle(`${msg.author.tag} ${multipliers[spin] < 1
            ? `lost ${roundNumber(args.chips - (args.chips * multipliers[spin]))}` 
            : `won ${roundNumber((args.chips * multipliers[spin]) - args.chips)}`} chips`)
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', query.balance, true)
          .setDescription(`
  『${multipliers[1]}』   『${multipliers[0]}』   『${multipliers[7]}』
  
  『${multipliers[2]}』      ${arrowmojis[spin]}        『${multipliers[6]}』
  
  『${multipliers[3]}』   『${multipliers[4]}』   『${multipliers[5]}』
      `);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(wofEmbed);
      }
      stopTyping(msg);

      return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 500`);
    } catch (err) {
      stopTyping(msg);
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`wheeloffortune\` command!
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