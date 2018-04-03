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
 * Retrieves the amount of chips another member has for the casino  
 * **Aliases**: `mbal`, `mcash`, `mbalance`, `mchips`
 * @module
 * @category casino
 * @name memberbalance
 * @example mchips Sagiri
 * @param {Member} AnyMember Member to get the balance for
 * @returns {MessageEmbed} Information about the current balance of the member
 */

const {MessageEmbed} = require('discord.js'),
  commando = require('discord.js-commando'),
  duration = require('moment-duration-format'), // eslint-disable-line no-unused-vars
  moment = require('moment'),
  path = require('path'),
  sql = require('sqlite'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class MemberBalanceCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'memberbalance',
      'memberName': 'memberbalance',
      'group': 'casino',
      'aliases': ['mbal', 'mcash', 'mbalance', 'mchips'],
      'description': 'Retrieves the amount of chips another member has for the casino',
      'format': 'MemberID|MemberName(partial or full)',
      'examples': ['memberbalance Sagiri'],
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
        }
      ]
    });
  }

  run (msg, args) {
    const mbalEmbed = new MessageEmbed();

    mbalEmbed
      .setAuthor(args.player.displayName, args.player.user.displayAvatarURL({'format': 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    sql.open(path.join(__dirname, '../../data/databases/casino.sqlite3'));

    sql.get(`SELECT * FROM "${msg.guild.id}" WHERE userID = "${args.player.id}";`).then((rows) => {
      if (!rows && global.casinoHasRan) {
        return msg.reply('looks like there that member has no chips yet!');
      } else if (!rows && !global.casinoHasRan) {
        global.casinoHasRan = true;
        
        return msg.reply(oneLine `some stupid SQLite mistake occured after the bot was restarted.
        Run that command again and it should work properly. No I cannot change this for as far as I know, don\'t ask`);
      }

      mbalEmbed.setDescription(stripIndents `
            **Balance**
            ${rows.balance}`);

      deleteCommandMessages(msg, this.client);

      return msg.embed(mbalEmbed);
    })
      .catch((e) => {
        if (!e.toString().includes(msg.guild.id) && !e.toString().includes(msg.author.id)) {
          console.error(`	 ${stripIndents `Fatal SQL Error occured while getting someones balance!
			Server: ${msg.guild.name} (${msg.guild.id})
			Author: ${msg.author.tag} (${msg.author.id})
			Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
			Error Message:`} ${e}`);

          return msg.reply(oneLine `Fatal Error occured that was logged on Favna\'s system.
              You can contact him on his server, get an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
        sql.run(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER, lasttopup TEXT);`).then(() => {
          sql.run(`INSERT INTO "${msg.guild.id}" (userID, balance, lasttopup) VALUES (?, ?, ?);`, [msg.author.id, 500, moment().format('YYYY-MM-DD HH:mm')]);
        });

        mbalEmbed.setDescription(stripIndents `
              **Balance**
              500
              **Daily Reset**
              in 24 hours`);

        deleteCommandMessages(msg, this.client);

        return msg.embed(mbalEmbed);
      });
  }
};