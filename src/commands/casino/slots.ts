/**
 * @file Casino SlotsCommand - Gamble your chips at the slot machine
 *
 * **Aliases**: `slot`, `fruits`
 * @module
 * @category casino
 * @name slots
 * @example slots 5
 * @param {number} ChipsAmount The amount of chips you want to gamble
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { readCasino, updateCasino } from '@components/Typeorm/DbInteractions';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { SlotMachine, SlotSymbol } from 'slot-machine';

type SlotsArgs = {
  chips: 1 | 2 | 3;
};

export default class SlotsCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'slots',
      aliases: [ 'slot', 'fruits' ],
      group: 'casino',
      memberName: 'slots',
      description: 'Gamble your chips at the slot machine',
      format: 'AmountOfChips',
      examples: [ 'slots 50' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'chips',
          prompt: 'How many chips do you want to gamble?',
          type: 'integer',
          oneOf: [ 1, 2, 3 ],
          parse: (chips: string) => roundNumber(Number(chips)),
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { chips }: SlotsArgs) {
    const slotEmbed = new MessageEmbed()
      .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
      .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

    try {
      const casino = await readCasino(msg.author.id, msg.guild.id);

      if (casino && casino.balance !== undefined && casino.balance >= 0) {
        if (chips > casino.balance) {
          return msg.reply(`you don't have enough chips to make that bet. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
        }

        const bar = new SlotSymbol('bar', {
          display: '<:bar:512360724153106442>',
          points: 50,
          weight: 20,
        });
        const cherry = new SlotSymbol('cherry', {
          display: '<:cherry:512360724472004630>',
          points: 6,
          weight: 100,
        });
        const diamond = new SlotSymbol('diamond', {
          display: '<:diamond:512360724660617244>',
          points: 15,
          weight: 40,
        });
        const lemon = new SlotSymbol('lemon', {
          display: '<:lemon:512360724589182976>',
          points: 8,
          weight: 80,
        });
        const seven = new SlotSymbol('seven', {
          display: '<:seven:512360724698365992>',
          points: 300,
          weight: 10,
        });
        const watermelon = new SlotSymbol('watermelon', {
          display: '<:watermelon:512360724656554027>',
          points: 10,
          weight: 60,
        });

        const machine = new SlotMachine(3, [ bar, cherry, diamond, lemon, seven, watermelon ]);
        const prevBal = casino.balance;
        const result = machine.play();

        let winningPoints = 0;

        switch (chips) {
          case 1:
            winningPoints += result.lines[1].points;
            break;
          case 2:
            for (let line = 0; line <= 2; ++line) {
              if (result.lines[line].isWon) {
                winningPoints += result.lines[line].points;
              }
            }
            break;
          case 3:
            for (const line of result.lines) {
              if (line.isWon) {
                winningPoints += line.points;
              }
            }
            break;
          default:
            break;
        }

        const newBalance = winningPoints ? casino.balance + winningPoints - chips : casino.balance - chips;

        await updateCasino({
          userId: msg.author.id,
          guildId: msg.guild.id,
          balance: newBalance,
        });

        /* eslint-disable no-nested-ternary */
        const titleString =
          chips === winningPoints
            ? 'won back their exact input'
            : chips > winningPoints
              ? `lost ${chips - winningPoints} chips ${
                winningPoints !== 0
                  ? `(slots gave back ${winningPoints})`
                  : ''
              }`
              : `won ${casino.balance - prevBal} chips`;
        /* eslint-enable no-nested-ternary */

        slotEmbed
          .setTitle(`${msg.author.tag} ${titleString}`)
          .addField('Previous Balance', prevBal, true)
          .addField('New Balance', newBalance, true)
          .setDescription(result.visualize());

        deleteCommandMessages(msg, this.client);

        return msg.embed(slotEmbed);
      }

      return msg.reply(oneLine`
        looks like you either don't have any chips yet or you used them all
        Run \`${msg.guild.commandPrefix}chips\` to get your first 500
        or run \`${msg.guild.commandPrefix}withdraw\` to withdraw some chips from your vault.`
      );
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`slots\` command!
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