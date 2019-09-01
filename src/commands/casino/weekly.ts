/**
 * @file Casino WeeklyCommand - Receive your weekly 3500 chips top up
 *
 * **Aliases**: `weeklytopup`, `weeklybonus`
 * @module
 * @category casino
 * @name weekly
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readCasino, writeCasino, updateCasinoWeekly } from '@components/Typeorm/DbInteractions';

export default class WeeklyCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'weekly',
      aliases: [ 'weeklytopup', 'weeklybonus' ],
      group: 'casino',
      memberName: 'weekly',
      description: 'Receive your weekly cash top up of 2000 chips',
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
        const weeklyDura = moment.duration(moment(casino.lastweekly).add(7, 'days').diff(moment()));
        const prevBal = casino.balance;

        let chipStr = '';
        let resetStr = '';

        if (weeklyDura.asDays() <= 0) {
          const newBalance = casino.balance + 2000;

          await updateCasinoWeekly({
            userId: msg.author.id,
            guildId: msg.guild.id,
            balance: newBalance,
            lastweekly: new Date(),
          });

          chipStr = `${prevBal} ➡ ${newBalance}`;
          resetStr = 'in 7 days';
          returnMsg = 'Topped up your balance with your weekly bonus of 2000 chips!';
        } else {
          chipStr = prevBal.toString();
          resetStr = weeklyDura.format('[in] d[ day and] HH[ hour]');
          returnMsg = 'Sorry but you are not due to get your weekly bonus chips yet, here is your current balance';
        }

        balEmbed.setDescription(stripIndents`
          **Balance**
          ${chipStr}
          **Weekly Reset**
          ${resetStr}`
        );

        deleteCommandMessages(msg, this.client);

        return msg.embed(balEmbed, returnMsg);
      }

      const newCasino = await writeCasino({
        userId: msg.author.id,
        guildId: msg.guild.id,
        balance: 2000,
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
          <@${this.client.owners[0].id}> Error occurred in \`weekly\` command!
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