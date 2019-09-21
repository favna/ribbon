/**
 * @file Casino DailyCommand - Receive your daily 500 chips top up
 *
 * **Aliases**: `topup`, `bonus`
 * @module
 * @category casino
 * @name daily
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readCasino, writeCasino, updateCasinoDaily } from '@components/Typeorm/DbInteractions';

export default class DailyCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'daily',
      aliases: [ 'topup', 'bonus' ],
      group: 'casino',
      memberName: 'daily',
      description: 'Receive your daily cash top up of 300 chips',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  public async run(msg: CommandoMessage) {
    let returnMsg = '';
    const balEmbed = new MessageEmbed()
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

    try {
      const casino = await readCasino(msg.author.id, msg.guild.id);

      if (casino && casino.balance !== undefined && casino.balance >= 0) {
        const dailyDura = moment.duration(
          moment(casino.lastdaily)
            .add(24, 'hours')
            .diff(Date.now())
        );
        const prevBal = casino.balance;

        let chipStr = '';
        let resetStr = '';
        const newBalance = prevBal + 300;

        if (dailyDura.asHours() <= 0) {
          await updateCasinoDaily({
            userId: msg.author.id,
            guildId: msg.guild.id,
            balance: newBalance,
            lastdaily: moment().format(),
          });

          chipStr = `${prevBal} ➡ ${newBalance}`;
          resetStr = 'in 24 hours';
          returnMsg = 'Topped up your balance with your daily 300 chips!';
        } else {
          chipStr = prevBal.toString();
          resetStr = dailyDura.format('[in] HH[ hour and] mm[ minute]');
          returnMsg = 'Sorry but you are not due to get your daily chips yet, here is your current balance';
        }

        balEmbed.setDescription(stripIndents`
          **Balance**
          ${chipStr}
          **Daily Reset**
          ${resetStr}`
        );

        deleteCommandMessages(msg, this.client);

        return msg.embed(balEmbed, returnMsg);
      }

      const newCasino = await writeCasino({
        userId: msg.author.id,
        guildId: msg.guild.id,
        balance: 500,
      });

      balEmbed.setDescription(stripIndents`
        **Balance**
        ${newCasino.balance}
        **Daily Reset**
        in 24 hours`
      );

      deleteCommandMessages(msg, this.client);

      return msg.embed(balEmbed, `You didn't have any chips yet so here's your first ${newCasino.balance}. Spend them wisely!`);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
          <@${this.client.owners[0].id}> Error occurred in \`daily\` command!
          **Server:** ${msg.guild.name} (${msg.guild.id})
          **Author:** ${msg.author.tag} (${msg.author.id})
          **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Error Message:** ${err}`
      );

      return msg.reply(oneLine`
          an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
          Want to know more about the error?
          Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`
      );
    }
  }
}