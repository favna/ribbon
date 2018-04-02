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
 * Shows the top 5 ranking players for your server  
 * **Aliases**: `lb`, `casinolb`
 * @module
 * @category casino
 * @name leaderboard
 * @returns {MessageEmbed} List of top ranking players
 */

const {MessageEmbed} = require('discord.js'),
  commando = require('discord.js-commando'),
  moment = require('moment'),
  path = require('path'),
  sql = require('sqlite'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class LeaderboardCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'leaderboard',
      'memberName': 'leaderboard',
      'group': 'casino',
      'aliases': ['lb', 'casinolb'],
      'description': 'Shows the top 5 ranking players for your server',
      'guildOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      }
    });
  }

  run (msg) {
    const lbEmbed = new MessageEmbed();

    lbEmbed
      .setTitle('Top 5 players')
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    sql.open(path.join(__dirname, '../../data/databases/casino.sqlite3'), {'cached': true});

    sql.all(`SELECT * FROM "${msg.guild.id}" ORDER BY balance DESC LIMIT 5;`).then((rows) => {
      if (!rows) {
        return msg.reply(`looks like there are no players in this server yet. Run \`${msg.guild.commandPrefix}chips\` to be the first`);
      }

      for (const player in rows) {
        lbEmbed.addField(`#${parseInt(player, 10) + 1} ${msg.guild.members.get(rows[player].userID).displayName}`, `Chips: ${rows[player].balance}`);
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(lbEmbed);
    })
      .catch((e) => {
        if (!e.toString().includes(msg.guild.id) && !e.toString().includes(msg.author.id)) {
          console.error(`	 ${stripIndents `Fatal SQL Error occured while retrieving the leaderboard!
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