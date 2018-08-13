/**
 * @file Moderation TimerListCommand - List all stored timed messages in the current guild  
 * **Aliases**: `tl`, `timelist`
 * @module
 * @category moderation
 * @name timerlist
 * @returns {MessageEmbed} List of all timed messages
 */

const Database = require('better-sqlite3'),
  moment = require('moment'),
  ms = require('ms'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {splitMessage} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TimerListCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'timerlist',
      memberName: 'timerlist',
      group: 'moderation',
      aliases: ['tl', 'timelist'],
      description: 'List all stored timed messages in the current guild',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run (msg) {
    startTyping(msg);
    const conn = new Database(path.join(__dirname, '../../data/databases/timers.sqlite3'));

    try {
      startTyping(msg);
      const rows = conn.prepare(`SELECT * FROM "${msg.guild.id}"`).all();
      let body = '';

      for (const row in rows) {
        body += `${stripIndents`
        **id:** ${rows[row].id}
        **interval:** ${ms(rows[row].interval, {long: true})}
        **channel:** <#${rows[row].channel}>
        **content:** ${rows[row].content}
        **last sent at:** ${moment(rows[row].lastsend).format('YYYY-MM-DD HH:mm [UTC]Z')}`}\n\n`;
      }

      deleteCommandMessages(msg, this.client);

      if (body.length >= 2000) {
        const messages = [],
          splitContent = splitMessage(body);

        for (const part in splitContent) {
          messages.push(await msg.embed({
            description: splitContent[part],
            color: msg.guild.me.displayColor
          }));
        }
        stopTyping(msg);

        return messages;
      }

      stopTyping(msg);

      return msg.embed({
        title: 'Timed messages stored on this server',
        description: body,
        color: msg.guild.me.displayColor
      });
    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no timed messages found for this server. Start saving your first with ${msg.guild.commandPrefix}timeradd`);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`timerlist\` command!
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