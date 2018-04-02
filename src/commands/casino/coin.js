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
 * Gamble your chips in a coin flip  
 * Payout is 1:2  
 * **Aliases**: `flip`, `cflip`
 * @module
 * @category casino
 * @name coin
 * @returns {MessageEmbed} Outcome of the coin flip
 */

const {MessageEmbed} = require('discord.js'),
  commando = require('discord.js-commando'),
  moment = require('moment'),
  path = require('path'),
  sql = require('sqlite'), 
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
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'chips',
          'prompt': 'How many chips do you want to gamble?',
          'type': 'integer'
        },
        {
          'key': 'side',
          'prompt': 'What side will the coin land on?',
          'type': 'string',
          'validate': (side) => {
            const validSides = ['heads', 'tails'];

            if (validSides.includes(side)) {
              return true;
            }

            return `Has to be either \`${validSides[0]}\` or \`${validSides[0]}\``;
          }
        }
      ]
    });
  }

  run (msg, args) {
    const coinEmbed = new MessageEmbed();

    coinEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({'format': 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    sql.open(path.join(__dirname, '../../data/databases/casino.sqlite3'), {'cached': true});

    sql.get(`SELECT * FROM "${msg.guild.id}" WHERE userID = "${msg.author.id}";`).then((rows) => {
      if (!rows) {
        return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 400`);
      }
      if (args.chips > rows.balance) {
        return msg.reply('you don\'t have enough chips to make that bet, wait for your next daily topup or ask someone to give you some');
      }

      const flip = Math.round(Number(Math.random())),
        prevBal = rows.balance,
        side = args.side === 'heads' ? 0 : 1;

      rows.balance -= args.chips;

      if (flip === side) {
        rows.balance += args.chips * 2;
      }

      rows.balance = Math.round(rows.balance);

      sql.run(`UPDATE "${msg.guild.id}" SET balance=? WHERE userID="${msg.author.id}";`, [rows.balance]);

      coinEmbed
        .setTitle(`${msg.author.tag} ${flip === side ? 'won' : 'lost'} ${args.chips} chips`)
        .addField('Previous Balance', prevBal, true)
        .addField('New Balance', rows.balance, true)
        .setImage(flip === 0 ? 'https://favna.xyz/images/ribbonhost/coinheads.png' : 'https://favna.xyz/images/ribbonhost/cointails.png');

      deleteCommandMessages(msg, this.client);

      return msg.embed(coinEmbed);
    })
      .catch((e) => {
        if (!e.toString().includes(msg.guild.id) && !e.toString().includes(msg.author.id)) {
          console.error(`	 ${stripIndents `Fatal SQL Error occured for someone making a casino coinflip!
              Server: ${msg.guild.name} (${msg.guild.id})
              Author: ${msg.author.tag} (${msg.author.id})
              Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
              Error Message:`} ${e}`);

          return msg.reply(oneLine `Fatal Error occured that was logged on Favna\'s system.
                You can contact him on his server, get an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }

        deleteCommandMessages(msg, this.client);

        return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 400`);
      });
  }
};