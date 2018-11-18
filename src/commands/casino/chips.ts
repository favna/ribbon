/**
 * @file Casino ChipsCommand - Retrieves your current amount of chips for the casino  
 * **Aliases**: `bal`, `cash`, `balance`
 * @module
 * @category casino
 * @name chips
 * @example chips
 * @returns {MessageEmbed} Information about your current balance
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import 'moment-duration-format';
import * as path from 'path';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class ChipsCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'chips',
      aliases: [ 'bal', 'cash', 'balance' ],
      group: 'casino',
      memberName: 'chips',
      description: 'Retrieves your current balance for the casino',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  public run (msg: CommandoMessage) {
    const balEmbed = new MessageEmbed();
    const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));

    balEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');
    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

      if (query) {
        const topupdate = moment(query.lasttopup).add(24, 'hours');
        const dura = moment.duration(topupdate.diff(moment()));

        balEmbed
          .setDescription(stripIndents`**Balance**
          ${query.balance}
          **Daily Reset**
          ${!(dura.asMilliseconds() <= 0) ? dura.format('[in] HH[ hour(s) and ]mm[ minute(s)]') : 'Right now!'}`);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(balEmbed);
      }
      conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($userid, $balance, $date);`).run({
        balance: '500',
        date: moment().format('YYYY-MM-DD HH:mm'),
        userid: msg.author.id,
      });
      stopTyping(msg);
    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER, lasttopup TEXT);`).run();

        conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($userid, $balance, $date);`).run({
          balance: '500',
          date: moment().format('YYYY-MM-DD HH:mm'),
          userid: msg.author.id,
        });
      } else {
        const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

        channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`chips\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}
        `);

        return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
        Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
      }
    }

    balEmbed.setDescription(stripIndents`
    **Balance**
    500
    **Daily Reset**
    in 24 hours`);

    deleteCommandMessages(msg, this.client);

    return msg.embed(balEmbed);
  }
}