/**
 * @file Extra RemindCommand - Set a reminder and Ribbon will remind you  
 * Works by reminding you after a given amount of minutes, hours or days in the format of `5m`, `2h` or `1d`  
 * **Aliases**: `remindme`, `reminder`
 * @module
 * @category extra
 * @name remind
 * @example remind 1h To continue developing Ribbon
 * @param {StringResolvable} Time Amount of time you want to be reminded in
 * @param {StringResolvable} Reminder Thing you want Ribbon to remind you of
 * @returns {Message} Confirmation the reminder was stored
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class RemindCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'remind',
      aliases: [ 'remindme', 'reminder' ],
      group: 'extra',
      memberName: 'remind',
      description: 'Set a reminder and Ribbon will remind you',
      format: 'Time Reminder',
      details: 'Works by reminding you after a given amount of minutes, hours or days in the format of `5m`, `2h` or `1d`',
      examples: [ 'remind 1h To continue developing Ribbon' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'time',
          prompt: 'Reply with the time in which you want to be reminded?',
          type: 'string',
          validate: (t: string) => {
            if ((/^(?:[0-9]{1,3}(?:m|min|mins|minute|minutes|h|hr|hour|hours|d|day|days){1})$/i).test(t)) {
              return true;
            }

            return stripIndents`Time until reminder has to be a formatting of \`Number\` \`Specification\`. Specification can have various option:
              - \`m\` , \`min\`, \`mins\`, \`minute\` or \`minutes\` for minutes
              - \`h\`, \`hr\`, \`hour\` or \`hours\` for hours
              - \`d\`, \`day\` or \`days\` for days

              Example: \`5m\` for 5 minutes from now; \`1d\` for 1 day from now
              Please reply with your properly formatted time until reminder or`;
          },
          parse: (t: string) => {
            const match = t.match(/[a-z]+|[^a-z]+/gi);
            let multiplier = 1;

            switch (match[1]) {
            case 'm':
            case 'min':
            case 'mins':
            case 'minute':
            case 'minutes':
              multiplier = 1;
              break;
            case 'h':
            case 'hr':
            case 'hour':
            case 'hours':
              multiplier = 60;
              break;
            case 'd':
            case 'day':
            case 'days':
              multiplier = 1440;
              break;
            default:
              multiplier = 1;
              break;
            }

            return Number(match[0]) * multiplier;
          },
        },
        {
          key: 'reminder',
          prompt: 'What do I need to remind you about?',
          type: 'string',
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { time, reminder }: {time: string, reminder: string}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/reminders.sqlite3'));
    const remindEmbed = new MessageEmbed();

    try {
      startTyping(msg);
      conn.prepare('INSERT INTO "reminders" VALUES ($userid, $remindtime, $remindtext);').run({
        remindtext: reminder,
        remindtime: moment().add(time, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss'),
        userid: msg.author.id,
      });
    } catch (err) {
      if ((/(?:no such table)/i).test(err.toString())) {
        conn.prepare('CREATE TABLE IF NOT EXISTS "reminders" (userID TEXT PRIMARY KEY, remindTime TEXT, remindText TEXT);').run();

        conn.prepare('INSERT INTO "reminders" VALUES ($userid, $remindtime, $remindtext);').run({
          remindtext: reminder,
          remindtime: moment().add(time, 'minutes')
            .format('YYYY-MM-DD HH:mm:ss'),
          userid: msg.author.id,
        });
      } else {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);
        const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

        channel.send(stripIndents`
          <@${this.client.owners[0].id}> Error occurred in \`remind\` command!
          **Server:** ${msg.guild.name} (${msg.guild.id})
          **Author:** ${msg.author.tag} (${msg.author.id})
          **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Input:** \`${time}\` || \`${reminder}\`
          **Error Message:** ${err}
          `);

        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
          Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }
    remindEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/reminders.png')
      .setTitle('Your reminder was stored!')
      .setDescription(reminder)
      .setFooter('Reminder will be sent')
      .setTimestamp(moment().add(time, 'minutes').toDate());

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(remindEmbed);
  }
}