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
 * Gamble your chips at the slot machine  
 * **Aliases**: `slot`, `fruits`
 * @module
 * @category casino
 * @name slots
 * @example slots 5
 * @param {number} ChipsAmount The amount of chips you want to gamble
 * @returns {MessageEmbed} Outcome of the spin
 */

const {MessageEmbed} = require('discord.js'), 
  {SlotMachine, SlotSymbol} = require('slot-machine'),
  commando = require('discord.js-commando'),
  moment = require('moment'),
  path = require('path'),
  sql = require('sqlite'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class SlotsCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'slots',
      'memberName': 'slots',
      'group': 'casino',
      'aliases': ['slot', 'fruits'],
      'description': 'Gamble your chips at the slot machine',
      'format': 'AmountOfChips',
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
        }
      ]
    });
  }

  run (msg, args) {
    const slotEmbed = new MessageEmbed();

    slotEmbed
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

      const bar = new SlotSymbol('bar', {
          'display': '<:bar:430366693630672916>',
          'points': 100,
          'weight': 30
        }),
        cherry = new SlotSymbol('cherry', {
          'display': '<:cherry:430366794230923266>',
          'points': 8,
          'weight': 100
        }),
        diamond = new SlotSymbol('diamond', {
          'display': '<:diamond:430366803789873162>',
          'points': 30,
          'weight': 40
        }),
        lemon = new SlotSymbol('lemon', {
          'display': '<:lemon:430366830784413727>',
          'points': 15,
          'weight': 80
        }),
        seven = new SlotSymbol('seven', {
          'display': '<:seven:430366839735058443>',
          'points': 300,
          'weight': 15
        });

      const machine = new SlotMachine(3, [bar, cherry, diamond, lemon, seven]), // eslint-disable-line one-var
        prevBal = rows.balance,
        results = machine.play();

      results.totalPoints !== 0 ? rows.balance += results.totalPoints - args.chips : rows.balance -= args.chips;

      sql.run(`UPDATE "${msg.guild.id}" SET balance=? WHERE userID="${msg.author.id}";`, [rows.balance]);

      slotEmbed
        .setTitle(`${msg.author.tag} ${results.totalPoints === 0 ? `lost ${args.chips}` : `won ${results.totalPoints - args.chips}`} chips`)
        .addField('Previous Balance', prevBal, true)
        .addField('New Balance', rows.balance, true)
        .setDescription(results.visualize());

      deleteCommandMessages(msg, this.client);

      return msg.embed(slotEmbed);
    })
      .catch((e) => {
        if (!e.toString().includes(msg.guild.id) && !e.toString().includes(msg.author.id)) {
          console.error(`	 ${stripIndents `Fatal SQL Error occured for someone playing the slot machine!
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