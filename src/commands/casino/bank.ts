/**
 * @file Casino BankCommand - View your vault content
 *
 * **Aliases**: `vault`
 * @module
 * @category casino
 * @name bank
 * @example bank
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readCasino } from '@components/Typeorm/DbInteractions';

export default class BankCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'bank',
      aliases: [ 'vault' ],
      group: 'casino',
      memberName: 'bank',
      description: 'View your vault content',
      examples: [ 'bank', 'vault' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  public async run(msg: CommandoMessage) {
    const bankEmbed = new MessageEmbed()
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
      .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/bank.png`);

    try {
      const casino = await readCasino(msg.author.id, msg.guild.id);

      if (casino && casino.balance !== undefined && casino.balance >= 0) {
        const dailyDura = moment.duration(moment(casino.lastdaily).add(24, 'hours').diff(moment()));
        const weeklyDura = moment.duration(moment(casino.lastweekly).add(7, 'days').diff(moment()));

        bankEmbed
          .setTitle(`${msg.author.tag}'s vault content`)
          .setDescription(stripIndents`
            **Vault Content**
            ${casino.vault}
            **Balance**
            ${casino.balance}
            **Daily Reset**
            ${(dailyDura.asMilliseconds() <= 0) ? 'Right now!' : dailyDura.format('[in] HH[ hour(s) and ]mm[ minute(s)]')}
            **Weekly Reset**
            ${(weeklyDura.asDays() <= 0) ? 'Right now!' : weeklyDura.format('[in] d[ day and] HH[ hour]')}`
          );

        deleteCommandMessages(msg, this.client);

        return msg.embed(bankEmbed);
      }

      return msg.reply(`looks like you didn't get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 500`);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`bank\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}
      `);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`
      );
    }
  }
}