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

const Database = require('better-sqlite3'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class RemindCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'remind',
      memberName: 'remind',
      group: 'extra',
      aliases: ['remindme', 'reminder'],
      description: 'Set a reminder and Ribbon will remind you',
      details: 'Works by reminding you after a given amount of minutes, hours or days in the format of `5m`, `2h` or `1d`',
      format: 'Time Reminder',
      examples: ['remind 1h To continue developing Ribbon'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'time',
          prompt: 'Reply with the time in which you want to be reminded?',
          type: 'string',
          validate: (t) => {
            if ((/^(?:[0-9]{1,2}(?:m|h|hr|d){1})$/i).test(t)) {
              return true;
            }

            return 'Has to be in the pattern of `50m`, `2h`, `3hr` or `01d` wherein `m` would be minutes, `h` (or `hr`) would be hours and `d` would be days';
          },
          parse: (t) => {
            const match = t.match(/[a-z]+|[^a-z]+/gi);
            let multiplier = 1;

            switch (match[1]) {
            case 'm':
              multiplier = 1;
              break;
            case 'h':
            case 'hr':
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
          key: 'reminder',
          prompt: 'What do I need to remind you about?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, {time, reminder}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/reminders.sqlite3')),
      remindEmbed = new MessageEmbed();

    try {
      startTyping(msg);
      conn.prepare('INSERT INTO "reminders" VALUES ($userid, $remindtime, $remindtext);').run({
        userid: msg.author.id,
        remindtime: moment().add(time, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss'),
        remindtext: reminder
      });
    } catch (err) {
      if ((/(?:no such table)/i).test(err.toString())) {
        conn.prepare('CREATE TABLE IF NOT EXISTS "reminders" (userID TEXT PRIMARY KEY, remindTime TEXT, remindText TEXT);').run();

        conn.prepare('INSERT INTO "reminders" VALUES ($userid, $remindtime, $remindtext);').run({
          userid: msg.author.id,
          remindtime: moment().add(time, 'minutes')
            .format('YYYY-MM-DD HH:mm:ss'),
          remindtext: reminder
        });
      } else {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
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
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({format: 'png'}))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/reminders.png')
      .setTitle('Your reminder was stored!')
      .setDescription(reminder)
      .setFooter('Reminder will be sent')
      .setTimestamp(moment().add(time, 'minutes')._d);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(remindEmbed);
  }
};