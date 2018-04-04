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
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @module
 * @category casino
 * @name wheeloffortune
 * @example wof 5
 * @param {number} ChipsAmount The amount of chips you want to gamble
 * @returns {MessageEmbed} Outcome of the game
 */

const {MessageEmbed} = require('discord.js'),
  Database = require('better-sqlite3'),
  commando = require('discord.js-commando'),
  moment = require('moment'),
  path = require('path'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class WheelOfFortuneCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'wheeloffortune',
      'memberName': 'wheeloffortune',
      'group': 'casino',
      'aliases': ['wheel', 'wof'],
      'description': 'Gamble your chips iat the wheel of fortune',
      'format': 'AmountOfChips',
      'examples': ['wof 50'],
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 5
      },
      'args': [
        {
          'key': 'chips',
          'prompt': 'How many chips do you want to gamble?',
          'type': 'integer',
          'validate': (chips) => {
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
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({'format': 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    try {
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

      if (query) {
        if (args.chips > query.balance) {
          return msg.reply(`you don\'t have enough chips to make that bet. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
        }

        const prevBal = query.balance;

        query.balance -= args.chips;
        query.balance += args.chips * multipliers[spin];
        query.balance = Math.round(query.balance);

        conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${msg.author.id}";`).run({'balance': query.balance});

        wofEmbed
          .setTitle(`${msg.author.tag} ${multipliers[spin] < 1 ? `lost ${args.chips - (args.chips * multipliers[spin])}` : `won ${Math.round((args.chips * multipliers[spin]) - args.chips)}`} chips`)
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', query.balance, true)
          .setDescription(`
  『${multipliers[1]}』   『${multipliers[0]}』   『${multipliers[7]}』
  
  『${multipliers[2]}』      ${arrowmojis[spin]}        『${multipliers[6]}』
  
  『${multipliers[3]}』   『${multipliers[4]}』   『${multipliers[5]}』
      `);

        deleteCommandMessages(msg, this.client);

        return msg.embed(wofEmbed);
      }

      return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 500`);
    } catch (e) {
      console.error(`	 ${stripIndents `Fatal SQL Error occured for someone spinning the Wheel of Fortune!
      Server: ${msg.guild.name} (${msg.guild.id})
      Author: ${msg.author.tag} (${msg.author.id})
      Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      Error Message:`} ${e}`);

      return msg.reply(oneLine `Fatal Error occured that was logged on Favna\'s system.
              You can contact him on his server, get an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};