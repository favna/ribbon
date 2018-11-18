/**
 * @file Moderation TimerAddCommand - Store timed messages  
 * These are messages Ribbon will repeat in a given channel on a given interval  
 * Useful for repeating about rules and such  
 * You can save multiple messages with varying intervals and channels by using this command multiple times  
 * The first time the message will be send is the next periodic check Ribbon will do (which is every 3 minutes) after adding the timed message  
 * The format for the interval is in minutes, hours or days in the format of `5m`, `2h` or `1d`  
 * **Aliases**: `timedmsgs`, `timedmsg`, timedmessages`, `timer`, `tm`
 * @module
 * @category moderation
 * @name timeradd
 * @example timeradd 1d #general Please read the rules everyone!
 * @param {StringResolvable} Interval The interval at which the message(s) should be repeated
 * @param {ChannelResolvable} Channel The channel to send the timed message in
 * @param {StringResolvable} Message  The message(s) to repeat
 * @returns {MessageEmbed} Confirmation the setting was stored
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { formatMs } from '../../components/ms';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components/util';

export default class TimerAddCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'timeradd',
      aliases: [ 'timedmsgs', 'timedmsg', 'timedmessages', 'timer', 'tm' ],
      group: 'moderation',
      memberName: 'timeradd',
      description: 'Store timed messages',
      format: 'Interval Channel Message',
      details: stripIndents`These are messages Ribbon will repeat in a given channel on a given interval
      Useful for repeating about rules and such
      You can save multiple messages with varying intervals and channels by using this command multiple times
      The first time the message will be send is the next periodic check Ribbon will do (which is every 3 minutes) after adding the timed message
      The format for the interval is in minutes, hours or days in the format of \`5m\`, \`2h\` or \`1d\``,
      examples: [ 'timeradd 1d #general Please read the rules everyone!' ],
      guildOnly: true,
      userPermissions: [ 'MANAGE_MESSAGES' ],
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'interval',
          prompt: 'At which interval should the message(s) be repeated?',
          type: 'string',
          validate: (t: string) => {
            if ((/^(?:[0-9]{1,2}(?:m|h|d){1})$/i).test(t)) {
              return true;
            }

            return 'Has to be in the pattern of `50m`, `2h` or `01d` wherein `m` would be minutes, `h` would be hours and `d` would be days';
          },
          parse: (t: string) => {
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

            return Number(match[0]) * multiplier * 60000;
          },
        },
        {
          key: 'timerChannel',
          prompt: 'In what channel should the message be repeated?',
          type: 'channel',
        },
        {
          key: 'content',
          prompt: 'What message should I repeat?',
          type: 'string',
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { interval, timerChannel, content }: {interval: number, timerChannel: TextChannel, content: string}) {
    startTyping(msg);
    const conn = new Database(path.join(__dirname, '../../data/databases/timers.sqlite3'));
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);
    const timedMsgEmbed = new MessageEmbed();

    try {
      startTyping(msg);
      conn.prepare(`INSERT INTO "${msg.guild.id}" (interval, channel, content, lastsend) VALUES ($interval, $channel, $content, $lastsend);`).run({
        content,
        interval,
        channel: timerChannel.id,
        lastsend: moment().subtract(interval, 'ms').format('YYYY-MM-DD HH:mm'),
      });
      stopTyping(msg);

    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (id INTEGER PRIMARY KEY AUTOINCREMENT, interval INTEGER, channel TEXT, content TEXT, lastsend TEXT);`).run();

        conn.prepare(`INSERT INTO "${msg.guild.id}" (interval, channel, content, lastsend) VALUES ($interval, $channel, $content, $lastsend);`).run({
          content,
          interval,
          channel: timerChannel.id,
          lastsend: moment().subtract(interval, 'ms').format('YYYY-MM-DD HH:mm'),
        });
      } else {
        const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

        channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`timeradd\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Interval:** ${formatMs(interval)}
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
      **Interval:** ${formatMs(interval)}
      **Channel:** <#${timerChannel.id}>
      **Message:** ${content}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, timedMsgEmbed);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(timedMsgEmbed);
  }
}