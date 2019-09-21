/**
 * @file Casino ChipsCommand - Retrieves your current amount of chips for the casino
 *
 * **Aliases**: `bal`, `cash`, `balance`
 * @module
 * @category casino
 * @name chips
 * @example chips
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { readCasino, writeCasino } from '@components/Typeorm/DbInteractions';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

export default class ChipsCommand extends Command {
  public constructor(client: CommandoClient) {
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

  public async run(msg: CommandoMessage) {
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
        const weeklyDura = moment.duration(
          moment(casino.lastweekly)
            .add(7, 'days')
            .diff(Date.now())
        );

        balEmbed.setDescription(stripIndents`
          **Balance**
          ${casino.balance}
          **Daily Reset**
          ${(dailyDura.asHours() <= 0) ? 'Right now!' : dailyDura.format('[in] HH[ hour(s) and ]mm[ minute(s)]')}
          **Weekly Reset**
          ${(weeklyDura.asDays() <= 0) ? 'Right now!' : weeklyDura.format('[in] d[ day and] HH[ hour]')}`
        );

        deleteCommandMessages(msg, this.client);

        return msg.embed(balEmbed);
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
        in 24 hours
        **Weekly Reset**
        in 7 days`
      );

      deleteCommandMessages(msg, this.client);

      return msg.embed(balEmbed);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
          <@${this.client.owners[0].id}> Error occurred in \`chips\` command!
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