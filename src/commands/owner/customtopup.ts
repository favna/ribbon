/**
 * @file Owner CustomTopUpCommand - Daniël Ocean doesn't give a crap about legality  
 * **Aliases**: `ctu`
 * @module
 * @category owner
 * @name customtopup
 * @example ctu Biscuit 1000
 * @param {GuildMemberResolvable} AnyMember The member you want to give some chips
 * @param {Number} ChipsAmount The amount of chips you want to give
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components/util';

export default class CustomTopUpCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'customtopup',
      aliases: [ 'ctu' ],
      group: 'owner',
      memberName: 'customtopup',
      description: 'Daniël Ocean doesn\'t give a crap about legality',
      format: 'AnyMember ChipsAmount',
      examples: [ 'ctu Biscuit 1000' ],
      guildOnly: false,
      ownerOnly: true,
      args: [
        {
          key: 'player',
          prompt: 'Which player should I give them to?',
          type: 'member',
        },
        {
          key: 'chips',
          prompt: 'How many chips do you want to give?',
          type: 'integer',
          validate: (chips: string) => Number(chips) >= 1 &&  Number(chips) <= 1000000 ? true : 'Reply with a chips amount between 1 and 10000. Example: `10`',
          parse: (chips: string) => roundNumber(Number(chips)),
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { player, chips }: {player: GuildMember, chips: number}) {
    startTyping(msg);
    const coinEmbed = new MessageEmbed();
    const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));

    coinEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

    try {
      const query = conn.prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`).get(player.id);

      if (query) {
        const prevBal = query.balance;

        query.balance += chips;

        conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${player.id}";`).run({ balance: query.balance });
        coinEmbed
          .setTitle('Daniël Ocean has stolen chips from Benedict for you')
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', query.balance, true);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(coinEmbed);
      }

      stopTyping(msg);

      return msg.reply('looks like that member has no chips yet');
    } catch (err) {
      stopTyping(msg);
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

      channel.send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`customtopup\` command!
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