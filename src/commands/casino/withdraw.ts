/**
 * @file Casino WithdrawCommand} - Withdraw chips from your vault
 *
 * **Aliases**: `wdraw`
 * @module
 * @category casino
 * @name withdraw
 * @example withdraw 100
 * @param {number} ChipsAmount The amount of chips to withdraw
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readCasino, writeCasino } from '@components/Typeorm/DbInteractions';

type WithdrawArgs = {
  chips: number;
};

export default class WithdrawCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'withdraw',
      aliases: [ 'wdraw' ],
      group: 'casino',
      memberName: 'withdraw',
      description: 'Withdraw chips from your vault',
      format: 'ChipsAmount',
      examples: [ 'withdraw 100' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'chips',
          prompt: 'How many chips do you want to withdraw?',
          type: 'integer',
          parse: (chips: string) => roundNumber(Number(chips)),
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { chips }: WithdrawArgs) {
    const withdrawEmbed = new MessageEmbed();

    withdrawEmbed
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
      .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/bank.png`);

    try {
      const casino = await readCasino(msg.author.id, msg.guild.id);

      if (casino && casino.balance !== undefined && casino.vault !== undefined && casino.balance >= 0) {
        if (chips > casino.vault) {
          return msg.reply(oneLine`
            you don\'t have that many chips stored in your vault.
            Use \`${msg.guild.commandPrefix}bank\` to check your vault content.`);
        }

        const prevBal = casino.balance;
        const prevVault = casino.vault;
        const newBalance = casino.balance + chips;
        const newVault = casino.balance - chips;

        await writeCasino({
          userId: msg.author.id,
          guildId: msg.guild.id,
          balance: newBalance,
          vault: newVault,
        });

        withdrawEmbed
          .setTitle('Vault withdrawal completed successfully')
          .addField('Previous balance', prevBal, true)
          .addField('New balance', newBalance, true)
          .addField('Previous vault content', prevVault, true)
          .addField('New vault content', newVault, true);

        deleteCommandMessages(msg, this.client);

        return msg.embed(withdrawEmbed);
      }

      return msg.reply(oneLine`
        looks like you either didn't get any chips or didn't save any to your vault
        Run \`${msg.guild.commandPrefix}chips\` to get your first 500
        or run \`${msg.guild.commandPrefix}deposit\` to deposit some chips to your vault`
      );
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`withdraw\` command!
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