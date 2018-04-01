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
 * Retrieves your current balance for the casino  
 * **Aliases**: `bal`, `cash`
 * @module
 * @category casino
 * @name balance
 * @returns {MessageEmbed} Information about your current balance
 */

const {MessageEmbed} = require('discord.js'),
  commando = require('discord.js-commando'),
  moment = require('moment'),
  path = require('path'),
  sql = require('sqlite'), 
  {
    oneLine,
    stripIndents
  } = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class BalanceCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'balance',
      'memberName': 'balance',
      'group': 'casino',
      'aliases': ['bal', 'cash'],
      'description': 'Retrieves your current balance for the casino',
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      }
    });
  }
  /* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/

  run (msg) {
    const balEmbed = new MessageEmbed();

    balEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({'format': 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
      .setThumbnail('https://favna.s-ul.eu/ZMsznB7f.png');

    sql.open(path.join(__dirname, '../../data/databases/casino.sqlite3'));

    sql.get(`SELECT * FROM "${msg.guild.id}" WHERE userID = "${msg.author.id}"`).then((rows) => {
      if (!rows) {
        sql.run(`INSERT INTO "${msg.guild.id}" (userID, balance, lasttopup) VALUES (?, ?, ?)`, [msg.author.id, 500, moment().format('YYYY-MM-DD[T]HH:mm')]);
        balEmbed.setDescription(stripIndents `
        **Balance**
        500
        **Daily Reset**
        in 24 hours`);
      } else {
        /* eslint-disable sort-vars*/
        const topupdate = moment(rows.lasttopup).add(24, 'hours'),
          duration = moment.duration(topupdate.diff()),
          hours = parseInt(duration.asHours(), 10),
          minutes = parseInt(duration.asMinutes(), 10) - (hours * 60);
        /* eslint-enable sort-vars*/

        balEmbed.setDescription(stripIndents `**Balance**
          ${rows.balance}
          **Daily Reset**
          in ${hours} hour(s) and ${minutes} minute(s)`);
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(balEmbed);
    })
      .catch((e) => {
        if (!e.toString().includes(msg.guild.id) && !e.toString().includes(msg.author.id)) {
          console.error(`	 ${stripIndents `Fatal SQL Error occured while getting someones balance!
			Server: ${msg.guild.name} (${msg.guild.id})
			Author: ${msg.author.tag} (${msg.author.id})
			Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			Error Message:`} ${e}`);

          return msg.reply(oneLine `Fatal SQL errored that was logged on Favna\'s system.
              You can contact him on his server, get an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
        sql.run(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER, lasttopup TEXT)`).then(() => {
          sql.run(`INSERT INTO "${msg.guild.id}" (userID, balance, lasttopup) VALUES (?, ?, ?)`, [msg.author.id, 500, moment().format('YYYY-MM-DD[T]HH:mm')]);
        });

        balEmbed.setDescription(stripIndents `
              **Balance**
              500
              **Daily Reset**
              in 24 hours`);

        deleteCommandMessages(msg, this.client);

        return msg.embed(balEmbed);
      });
  }
};