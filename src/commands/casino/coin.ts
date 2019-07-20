/**
 * @file Casino CoinCommand - Gamble your chips in a coin flip
 *
 * Payout is 1:2
 * **Aliases**: `flip`, `cflip`
 * @module
 * @category casino
 * @name coin
 * @example coin 10 heads
 * @param {number} AmountOfChips Amount of chips you want to gamble
 * @param {string} CoinSide The side of the coin you want to bet on
 */

import { ASSET_BASE_PATH, CoinSide, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import path from 'path';

type CoinArgs = {
  chips: number;
  side: CoinSide;
};

export default class CoinCommand extends Command {
  public constructor(client: CommandoClient) {
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
        duration: 3,
      },
      args: [
        {
          key: 'chips',
          prompt: 'How many chips do you want to gamble?',
          type: 'casino',
        },
        {
          key: 'side',
          prompt: 'What side will the coin land on?',
          type: 'coinside',
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { chips, side }: CoinArgs) {
    const coinEmbed = new MessageEmbed();
    const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));

    coinEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

    try {
      let { balance } = conn.prepare(`SELECT balance FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

      if (balance >= 0) {
        if (chips > balance) {
          return msg.reply(oneLine`
            you don't have enough chips to make that bet.
            Use \`${msg.guild.commandPrefix}chips\` to check your current balance.
            or withdraw some chips from your vault with \`${msg.guild.commandPrefix}withdraw\``);
        }

        const flip = Math.random() >= 0.5;
        const prevBal = balance;
        const res = side === 'heads';

        balance -= chips;

        if (flip === res) balance += chips * 2;

        balance = roundNumber(balance);

        conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${msg.author.id}";`)
          .run({ balance });

        coinEmbed
          .setTitle(`${msg.author.tag} ${flip === res ? 'won' : 'lost'} ${chips} chips`)
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', balance, true)
          .setImage(flip === res
            ? `${ASSET_BASE_PATH}/ribbon/coin${side}.png`
            : `${ASSET_BASE_PATH}/ribbon/coin${side === 'heads' ? 'tails' : 'heads'}.png`);

        deleteCommandMessages(msg, this.client);

        return msg.embed(coinEmbed);
      }

      return msg.reply(oneLine`
        looks like you either don't have any chips yet or you used them all
        Run \`${msg.guild.commandPrefix}chips\` to get your first 500
        or run \`${msg.guild.commandPrefix}withdraw\` to withdraw some chips from your vault.`);
    } catch (err) {
      if (/(?:no such table|Cannot destructure property)/i.test(err.toString())) {
        conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER , lastdaily TEXT , lastweekly TEXT , vault INTEGER);`)
          .run();

        return msg.reply(`looks like you don't have any chips yet, please use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
      }
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`coin\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
}