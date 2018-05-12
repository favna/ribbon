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
 * @file Moderation TimerAddCommand - Store timed messages  
 * These are messages the bot will repeat in a given channel on a given interval  
 * Useful for repeating about rules and such  
 * You can save multiple messages with varying intervals and channels by using this command multiple times  
 * The first time the message will be send is the next periodic check the bot will do (which is every minute) after adding the timed message  
 * **Aliases**: `timedmsgs`, `timedmsg`, timedmessages`, `timer`, `tm`
 * @module
 * @category moderation
 * @name timeradd
 * @example timeradd #general 1d Please read the rules everyone!
 * @param {string} Interval The interval at which the message(s) should be repeated
 * @param {channel} Channel The channel to send the timed message in
 * @param {string} Message  The message(s) to repeat
 * @returns {MessageEmbed} Confirmation the setting was stored
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  ms = require('ms'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TimerAddCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'timeradd',
      memberName: 'timeradd',
      group: 'moderation',
      aliases: ['timedmsgs', 'timedmsg', 'timedmessages', 'timer', 'tm'],
      description: 'Store timed messages',
      details: stripIndents`These are messages the bot will repeat in a given channel on a given interval
      You can save multiple messages with varying intervals and channels by using this command multiple times
      The first time the message will be send is the next periodic check the bot will do (which is every minute) after adding the timed message`,
      format: 'Interval Channel Message',
      examples: ['timeradd #general 1d Please read the rules everyone!'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'interval',
          prompt: 'At which interval should the message(s) be repeated?',
          type: 'string',
          validate: (t) => {
            if (/^(?:[0-9]{1,2}(?:m|h|d){1})$/i.test(t)) {
              return true;
            }

            return 'Has to be in the pattern of `50m`, `2h` or `01d` wherein `m` would be minutes, `h` would be hours and `d` would be days';
          },
          parse: (t) => {
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

            return parseInt(match[0], 10) * multiplier * 60000;
          }
        },
        {
          key: 'channel',
          prompt: 'In what channel should the message be repeated?',
          type: 'channel'
        },
        {
          key: 'content',
          prompt: 'What message should I repeat?',
          type: 'string'
        }
      ]
    });
  }

  hasPermission (msg) {
    return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
  }

  run (msg, {interval, channel, content}) {
    startTyping(msg);
    const conn = new Database(path.join(__dirname, '../../data/databases/timers.sqlite3')),
      modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.exists('name', 'mod-logs')
          ? msg.guild.channels.find('name', 'mod-logs').id
          : null),
      timedMsgEmbed = new MessageEmbed();

    try {
      startTyping(msg);
      conn.prepare(`INSERT INTO "${msg.guild.id}" (interval, channel, content, lastsend) VALUES ($interval, $channel, $content, $lastsend);`).run({
        interval,
        channel: channel.id,
        content,
        lastsend: moment().subtract(interval, 'ms').format('YYYY-MM-DD HH:mm') // eslint-disable-line newline-per-chained-call
      });
      stopTyping(msg);

    } catch (err) {
      stopTyping(msg);
      if (/(?:no such table)/i.test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (id INTEGER PRIMARY KEY AUTOINCREMENT, interval INTEGER, channel TEXT, content TEXT, lastsend TEXT);`).run();

        conn.prepare(`INSERT INTO "${msg.guild.id}" (interval, channel, content, lastsend) VALUES ($interval, $channel, $content, $lastsend);`).run({
          interval,
          channel: channel.id,
          content,
          lastsend: moment().subtract(interval, 'ms').format('YYYY-MM-DD HH:mm') // eslint-disable-line newline-per-chained-call
        });
      } else {
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`timeradd\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Interval:** ${ms(interval, {long: true})}
                **Channel:** ${channel.name} (${channel.id})>
                **Message:** ${content}
                **Error Message:** ${err}
                `);

        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }

    timedMsgEmbed
      .setColor('#9EF7C1')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Action:** Timed message stored
      **Interval:** ${ms(interval, {long: true})}
      **Channel:** <#${channel.id}>
      **Message:** ${content}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                        (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                        This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: timedMsgEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(timedMsgEmbed);
  }
};