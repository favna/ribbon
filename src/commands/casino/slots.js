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
 * @file Casino SlotsCommand - Gamble your chips at the slot machine  
 * **Aliases**: `slot`, `fruits`
 * @module
 * @category casino
 * @name slots
 * @example slots 5
 * @param {number} ChipsAmount The amount of chips you want to gamble
 * @returns {MessageEmbed} Outcome of the spin
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {SlotMachine, SlotSymbol} = require('slot-machine'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class SlotsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'slots',
      memberName: 'slots',
      group: 'casino',
      aliases: ['slot', 'fruits'],
      description: 'Gamble your chips at the slot machine',
      format: 'AmountOfChips',
      examples: ['slots 50'],
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
            if (/^[+]?\d+$/.test(chips) && chips >= 1 && chips <= 3) {
              return true;
            }

            return stripIndents`Reply with a chips amount
                            Has to be either 1, 2 or 3
                            1 to just win on the middle horizontal line
                            2 to win on all horizontal lines
                            3 to win on all horizontal lines **and** the two diagonal lines`;
          }
        }
      ]
    });
  }

  run (msg, args) {
    const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3')),
      slotEmbed = new MessageEmbed();

    slotEmbed
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

        const bar = new SlotSymbol('bar', {
            display: '<:bar:430366693630672916>',
            points: 50,
            weight: 20
          }),
          cherry = new SlotSymbol('cherry', {
            display: '<:cherry:430366794230923266>',
            points: 6,
            weight: 100
          }),
          diamond = new SlotSymbol('diamond', {
            display: '<:diamond:430366803789873162>',
            points: 15,
            weight: 40
          }),
          lemon = new SlotSymbol('lemon', {
            display: '<:lemon:430366830784413727>',
            points: 8,
            weight: 80
          }),
          seven = new SlotSymbol('seven', {
            display: '<:seven:430366839735058443>',
            points: 300,
            weight: 10
          }),
          watermelon = new SlotSymbol('watermelon', {
            display: '<:watermelon:430366848710737920>',
            points: 10,
            weight: 60
          });

        const machine = new SlotMachine(3, [bar, cherry, diamond, lemon, seven, watermelon]), // eslint-disable-line one-var
          prevBal = query.balance,
          result = machine.play();

        let titleString = '',
          winningPoints = 0;

        if (args.chips === 1 && result.lines[1].isWon) {
          winningPoints += result.lines[1].points;
        } else if (args.chips === 2) {
          for (let i = 0; i <= 2; i += 1) {
            if (result.lines[i].isWon) {
              winningPoints += result.lines[i].points;
            }
          }
        } else if (args.chips === 3) {
          for (let i = 0; i < result.lines.length; i += 1) {
            if (result.lines[i].isWon) {
              winningPoints += result.lines[i].points;
            }
          }
        }

        winningPoints !== 0 ? query.balance += winningPoints - args.chips : query.balance -= args.chips;

        conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${msg.author.id}";`).run({balance: query.balance});

        if (args.chips === winningPoints) {
          titleString = 'won back their exact input';
        } else if (args.chips > winningPoints) {
          titleString = `lost ${args.chips - winningPoints} chips ${winningPoints !== 0 ? `(slots gave back ${winningPoints})` : ''}`;
        } else {
          titleString = `won ${query.balance - prevBal} chips`;
        }

        slotEmbed
          .setTitle(`${msg.author.tag} ${titleString}`)
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', query.balance, true)
          .setDescription(result.visualize());

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(slotEmbed);
      }
      stopTyping(msg);

      return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 500`);
    } catch (err) {
      stopTyping(msg);
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`slots\` command!
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