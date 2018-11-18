/**
 * @file Casino CoinCommand - Gamble your chips in a coin flip  
 * Payout is 1:2  
 * **Aliases**: `flip`, `cflip`
 * @module
 * @category casino
 * @name coin
 * @example coin 10 heads
 * @param {Number} AmountOfChips Amount of chips you want to gamble
 * @param {StringResolvable} CoinSide The side of the coin you want to bet on
 * @returns {MessageEmbed} Outcome of the coin flip
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components/util';

enum CoinSide {
  heads = 'heads',
  head = 'heads',
  tails = 'tails',
  tail = 'tails',
}

export default class CoinCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'coin',
      aliases: [ 'flip', 'cflip' ],
      group: 'casino',
      memberName: 'coin',
      description: 'Gamble your chips in a coin flip',
      format: 'AmountOfChips CoinSide',
      examples: [ 'coin 50 heads' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 5,
      },
      args: [
        {
          key: 'chips',
          prompt: 'How many chips do you want to gamble?',
          type: 'integer',
          validate: (chips: string) => Number(chips) >= 1 && Number(chips) <= 1000000 ? true : 'Reply with a chips amount between 1 and 10000. Example: `10`',
          parse: (chips: string) => roundNumber(Number(chips)),
        },
        {
          key: 'side',
          prompt: 'What side will the coin land on?',
          type: 'string',
          validate: (side: string) => Object.keys(CoinSide).includes(side.toLowerCase()) ? true : `Has to be one of ${Object.keys(CoinSide).map(coin => `\`${coin}\``).join(', ')}`,
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { chips, side }: {chips: number, side: string}) {
    const coinEmbed = new MessageEmbed();
    const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));

    coinEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    try {
      startTyping(msg);
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

      if (query) {
        if (chips > query.balance) {
          return msg.reply(`you don\'t have enough chips to make that bet. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
        }

        if (side === 'head') side = 'heads';
        if (side === 'tail') side = 'tails';

        const flip = Math.random() >= 0.5;
        const prevBal = query.balance;
        const res = side === 'heads';

        query.balance -= chips;

        if (flip === res) query.balance += chips * 2;

        query.balance = roundNumber(query.balance);

        conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${msg.author.id}";`).run({ balance: query.balance });

        coinEmbed
          .setTitle(`${msg.author.tag} ${flip === res ? 'won' : 'lost'} ${chips} chips`)
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', query.balance, true)
          .setImage(flip === res ? `https://favna.xyz/images/ribbonhost/coin${side.toLowerCase()}.png`
            : `https://favna.xyz/images/ribbonhost/coin${side.toLowerCase() === 'heads' ? 'tails' : 'heads'}.png`);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(coinEmbed);
      }
      stopTyping(msg);

      return msg.reply(`looks like you didn\'t get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 500`);
    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER, lasttopup TEXT);`).run();

        return msg.reply(`looks like you don\'t have any chips yet, please use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

      channel.send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`coin\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
}