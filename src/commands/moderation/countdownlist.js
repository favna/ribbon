/**
 * @file Moderation CountDownList - List all stored countdown messages in the current guild  
 * **Aliases**: `cl`, `cdlist`
 * @module
 * @category moderation
 * @name countdownlist
 * @returns {MessageEmbed} List of all countdowns
 */

import Database from 'better-sqlite3';
import moment from 'moment';
import momentduration from 'moment-duration-format'; // eslint-disable-line no-unused-vars
import path from 'path';
import {Command} from 'discord.js-commando';
import {splitMessage} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class CountDownList extends Command {
  constructor (client) {
    super(client, {
      name: 'countdownlist',
      memberName: 'countdownlist',
      group: 'moderation',
      aliases: ['cd', 'cdlist'],
      description: 'List all stored countdown messages in the current guild',
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
    const conn = new Database(path.join(__dirname, '../../data/databases/countdowns.sqlite3'));

    try {
      startTyping(msg);
      const rows = conn.prepare(`SELECT * FROM "${msg.guild.id}"`).all();
      let body = '';

      for (const row in rows) {
        body += `${stripIndents`
        **id:** ${rows[row].id}
        **Event at:** ${moment(rows[row].datetime).format('YYYY-MM-DD HH:mm')}
        **Countdown Duration:** ${moment.duration(moment(rows[row].datetime).diff(moment(), 'days'), 'days').format('w [weeks][, ] d [days] [and] h [hours]')}
        **Tag on event:** ${rows[row].tag === 'none' ? 'No one' : `@${rows[row].tag}`}
        **Channel:** <#${rows[row].channel}> (\`${rows[row].channel}\`)
        **Content:** ${rows[row].content}
        **Last sent at:** ${moment(rows[row].lastsend).format('YYYY-MM-DD HH:mm [UTC]Z')}`}\n\n`;
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
        title: 'Countdowns stored on this server',
        description: body,
        color: msg.guild.me.displayColor
      });
    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no countdowns found for this server. Start saving your first with ${msg.guild.commandPrefix}countdownadd`);
      }
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`countdownlist\` command!
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