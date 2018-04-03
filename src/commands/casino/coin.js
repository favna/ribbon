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
 * @file Casino CoinCommand - Gamble your chips in a coin flip  
 * Payout is 1:2  
 * **Aliases**: `flip`, `cflip`
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @license GPL-3.0-or-later
 * @module
 * @category casino
 * @name coin
 * @example coin 10 heads
 * @param {number} AmountOfChips Amount of chips you want to gamble
 * @param {string} CoinSide The side of the coin you want to bet on
 * @returns {MessageEmbed} Outcome of the coin flip
 */

const {MessageEmbed} = require('discord.js'),
  Database = require('better-sqlite3'),
  commando = require('discord.js-commando'),
  moment = require('moment'),
  path = require('path'),
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class CoinCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'coin',
      'memberName': 'coin',
      'group': 'casino',
      'aliases': ['flip', 'cflip'],
      'description': 'Gamble your chips in a coin flip',
      'format': 'AmountOfChips CoinSide',
      'examples': ['coin 50 heads'],
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'chips',
          'prompt': 'How many chips do you want to gamble?',
          'type': 'integer',
          'validate': (chips) => {
            if (/^[+]?\d+([.]\d+)?$/.test(chips) && chips > 1 && chips < 10000) {
              return true;
            }

            return 'Chips amount has to be a number between 1 and 10000';
          }
        },
        {
          'key': 'side',
          'prompt': 'What side will the coin land on?',
          'type': 'string',
          'validate': (side) => {
            const validSides = ['heads', 'head', 'tails', 'tail'];

            if (validSides.includes(side.toLowerCase())) {
              return true;
            }

            return `Has to be either \`${validSides[0]}\` or \`${validSides[1]}\``;
          }
        }
      ]
    });
  }

  run (msg, args) {
    const coinEmbed = new MessageEmbed(),
      conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));

    coinEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({'format': 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    try {
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?`).get(msg.author.id);

      if (query) {
        if (args.chips > query.balance) {
          return msg.reply(`you don\'t have enough chips to make that bet. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
        }

        if (args.side === 'head') args.side = 'heads'; // eslint-disable-line curly
        if (args.side === 'tail') args.side = 'tails'; // eslint-disable-line curly

        const flip = Math.round(Number(Math.random())),
          prevBal = query.balance,
          side = args.side === 'heads' ? 0 : 1;

        query.balance -= args.chips;

        if (flip === side) query.balance += args.chips * 2; // eslint-disable-line curly

        query.balance = Math.round(query.balance);

        conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${msg.author.id}";`).run({'balance': query.balance});

        coinEmbed
          .setTitle(`${msg.author.tag} ${flip === side ? 'won' : 'lost'} ${args.chips} chips`)
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', query.balance, true)
          .setImage(flip === 0 ? 'https://favna.xyz/images/ribbonhost/coinheads.png' : 'https://favna.xyz/images/ribbonhost/cointails.png');

        deleteCommandMessages(msg, this.client);

        return msg.embed(coinEmbed);
      }

      return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 400`);
    } catch (e) {
      console.error(`	 ${stripIndents `Fatal SQL Error occured while topping up someones balance!
      Server: ${msg.guild.name} (${msg.guild.id})
      Author: ${msg.author.tag} (${msg.author.id})
      Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      Error Message:`} ${e}`);

      return msg.reply(oneLine `Fatal Error occured that was logged on Favna\'s system.
              You can contact him on his server, get an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};