/**
 * @file Casino GiveCommand - Give another player some chips
 *
 * **Aliases**: `donate`
 * @module
 * @category casino
 * @name give
 * @example give Favna 10
 * @param {GuildMemberResolvable} AnyMember The member you want to give some chips
 * @param {number} ChipsAmount The amount of chips you want to give
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readCasinoMultiple, writeCasinoMultiple } from '@components/Typeorm/DbInteractions';

interface GiveArgs {
  player: GuildMember;
  chips: number;
}

export default class GiveCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'give',
      aliases: [ 'donate' ],
      group: 'casino',
      memberName: 'give',
      description: 'Give another player some chips',
      format: 'AnyMember ChipsAmount',
      examples: [ 'give GuyInShroomSuit 50' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'player',
          prompt: 'Which player should I give them to?',
          type: 'member',
        },
        {
          key: 'chips',
          prompt: 'How many chips do you want to give?',
          type: 'casino',
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { player, chips }: GiveArgs) {
    const giveEmbed = new MessageEmbed()
      .setTitle('Transaction Log')
      .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

    try {
      const casino = await readCasinoMultiple([
        {
          userId: msg.author!.id,
          guildId: msg.guild.id,
        },
        {
          userId: player.id,
          guildId: player.guild.id,
        }
      ]);

      if (casino.length !== 2) throw new Error('no_balance');

      casino.forEach(row => {
        if (row.userId === msg.author!.id && row.balance !== undefined && chips > row.balance) {
          throw new Error('insufficient_balance');
        }
      });

      let giverEntry = 0;
      let receiverEntry = 0;

      casino.forEach((row, index) => {
        if (row.userId === msg.author!.id) giverEntry = index;
        if (row.userId === player.id) receiverEntry = index;
      });

      const oldGiverBalance = casino[giverEntry].balance;
      const oldReceiverEntry = casino[receiverEntry].balance;

      const newGiverBalance = casino[giverEntry].balance! - chips;
      const newReceiverBalance = casino[receiverEntry].balance! + chips;

      await writeCasinoMultiple([
        {
          userId: msg.author!.id,
          guildId: msg.guild.id,
          balance: newGiverBalance,
        },
        {
          userId: player.id,
          guildId: player.guild.id,
          balance: newReceiverBalance,
        }
      ]);

      giveEmbed
        .addField(msg.member!.displayName, `${oldGiverBalance} ➡ ${newGiverBalance}`)
        .addField(player.displayName, `${oldReceiverEntry} ➡ ${newReceiverBalance}`);

      deleteCommandMessages(msg, this.client);

      return msg.embed(giveEmbed);
    } catch (err) {
      if (/(?:no_balance)/i.test(err.toString())) {
        return msg.reply(`looks like either you or the person you want to donate to has no balance yet. Use \`${msg.guild.commandPrefix}chips\` to get some`);
      }

      if (/(?:insufficient_balance)/i.test(err.toString())) {
        return msg.reply(`you don't have that many chips to donate. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
      }

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`give\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author!.tag} (${msg.author!.id})
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