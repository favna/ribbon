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
 * Give another player some chips  
 * **Aliases**: `donate`
 * @module
 * @category casino
 * @name give
 * @returns {MessageEmbed} Changed balances of the two players
 */

const {MessageEmbed} = require('discord.js'),
  commando = require('discord.js-commando'),
  moment = require('moment'),
  path = require('path'),
  sql = require('sqlite'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class GiveCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'give',
      'memberName': 'give',
      'group': 'casino',
      'aliases': ['donate'],
      'description': 'Give another player some chips',
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'player',
          'prompt': 'Which player should I give them to?',
          'type': 'member'
        },
        {
          'key': 'chips',
          'prompt': 'How many chips do you want to give?',
          'type': 'integer'
        }
      ]
    });
  }

  run (msg, args) {
    const giveEmbed = new MessageEmbed();

    giveEmbed
      .setTitle('Transaction Log')
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    sql.open(path.join(__dirname, '../../data/databases/casino.sqlite3'), {'cached': true});

    sql.all(`SELECT * FROM "${msg.guild.id}" WHERE userID = "${msg.author.id}" OR userID = "${args.player.id}";`).then((rows) => {
      if (!rows) {
        return msg.reply(`looks like there are no players in this server yet. Run \`${msg.guild.commandPrefix}chips\` to be the first`);
      }
      if (rows.length !== 2) {
        return msg.reply(`looks like either you or the person you want to donate to has no balance yet. Use \`${msg.guild.commandPrefix}chips\` to get some`);
      }

      let giverEntry = 0,
        recieverEntry = 0;

      for (const row in rows) {
        if (rows[row].userID === msg.author.id) {
          giverEntry = row;
        }
        if (rows[row].userID === args.player.id) {
          recieverEntry = row;
        }
      }

      const oldGiverBalance = rows[giverEntry].balance,
        oldRecieverEntry = rows[recieverEntry].balance;

      rows[giverEntry].balance -= args.chips;
      rows[recieverEntry].balance += args.chips;

      sql.run(`UPDATE "${msg.guild.id}" SET balance=? WHERE userID="${rows[giverEntry].userID}";`, [rows[giverEntry].balance]);
      sql.run(`UPDATE "${msg.guild.id}" SET balance=? WHERE userID="${rows[recieverEntry].userID}";`, [rows[recieverEntry].balance]);

      giveEmbed
        .addField(msg.member.displayName, `${oldGiverBalance} ➡ ${rows[giverEntry].balance}`)
        .addField(args.player.displayName, `${oldRecieverEntry} ➡ ${rows[recieverEntry].balance}`);

      deleteCommandMessages(msg, this.client);

      return msg.embed(giveEmbed);
    })
      .catch((e) => {
        if (!e.toString().includes(msg.guild.id) && !e.toString().includes(msg.author.id)) {
          console.error(`	 ${stripIndents `Fatal SQL Error occured while someone was trying to donate some chips!
              Server: ${msg.guild.name} (${msg.guild.id})
              Author: ${msg.author.tag} (${msg.author.id})
              Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
              Amount of chips: ${args.chips}
              Target member: ${args.player.user.tag} (${args.player.id})
              Error Message:`} ${e}`);

          return msg.reply(oneLine `Fatal Error occured that was logged on Favna\'s system.
                You can contact him on his server, get an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }

        deleteCommandMessages(msg, this.client);

        return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 400`);
      });
  }
};