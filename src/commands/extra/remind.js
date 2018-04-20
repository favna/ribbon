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
 * @file Extra RemindCommand - Set a reminder and the bot will remind you  
 * Works by reminding you after a given amount of minutes, hours or days in the format of `5m`, `2h` or `1d`  
 * **Aliases**: `remindme`, `reminder`
 * @module
 * @category extra
 * @name remind
 * @example remind 1h To continue developing Ribbon
 * @param {string} Time Amount of time you want to be reminded in
 * @param {string} Reminder Thing you want the bot to remind you of
 * @returns {Message} Confirmation the reminder was stored
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class RemindCommand extends Command {
  constructor (client) {
    super(client, {
      'name': 'remind',
      'memberName': 'remind',
      'group': 'extra',
      'aliases': ['remindme', 'reminder'],
      'description': 'Set a reminder and the bot will remind you',
      'details': 'Works by reminding you after a given amount of minutes, hours or days in the format of `5m`, `2h` or `1d`',
      'format': 'Time Reminder',
      'examples': ['remind 1h To continue developing Ribbon'],
      'guildOnly': false,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'time',
          'prompt': 'Reply with the time in which you want to be reminded?',
          'type': 'string',
          'validate': (t) => {
            if (/^(?:[0-9]{1,2}(?:m|h|d){1})$/i.test(t)) {
              return true;
            }

            return 'Has to be in the pattern of `50m`, `2h` or `01d` wherein `m` would be minutes, `h` would be hours and `d` would be days';
          },
          'parse': (t) => {
            const match = t.match(/[a-z]+|[^a-z]+/gi);
            let multiplier = 1;

            switch (match[1]) {
            case 'm':
              multiplier = 1;
              break;
            case 'h':
              multiplier = 60;
              break;
            case 'd':
              multiplier = 1440;
              break;
            default:
              multiplier = 1;
              break;
            }

            return parseInt(match[0], 10) * multiplier;
          }
        },
        {
          'key': 'reminder',
          'prompt': 'What do I need to remind you about?',
          'type': 'string'
        }
      ]
    });
  }

  run (msg, args) {
    const conn = new Database(path.join(__dirname, '../../data/databases/reminders.sqlite3')),
      remindEmbed = new MessageEmbed();

    try {
      conn.prepare('CREATE TABLE IF NOT EXISTS "reminders" (userID TEXT, remindTime TEXT, remindText TEXT);').run();
      conn.prepare('INSERT INTO "reminders" VALUES ($userid, $remindtime, $remindtext);').run({
        'userid': msg.author.id,
        'remindtime': moment().add(args.time, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss'),
        'remindtext': args.reminder
      });

      remindEmbed
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({'format': 'png'}))
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#2255EE')
        .setThumbnail('https://favna.xyz/images/ribbonhost/reminders.png')
        .setTitle('Your reminder was stored!')
        .setDescription(args.reminder)
        .setFooter('Reminder will be sent')
        .setTimestamp(moment().add(args.time, 'minutes')._d);

      deleteCommandMessages(msg, this.client);

      return msg.embed(remindEmbed);
    } catch (e) {
      console.error(`	 ${stripIndents`Fatal SQL Error occurred while setting someone's reminder!
        Server: ${msg.guild.name} (${msg.guild.id})
        Author: ${msg.author.tag} (${msg.author.id})
        Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        Error Message:`} ${e}`);

      return msg.reply(oneLine`Fatal Error occurred that was logged on Favna\'s system.
                You can contact him on his server, get an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};