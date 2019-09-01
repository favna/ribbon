/**
 * @file Owner CustomTopUpCommand - Daniël Ocean doesn't give a crap about legality
 *
 * **Aliases**: `ctu`
 * @module
 * @category owner
 * @name customtopup
 * @example ctu Biscuit 1000
 * @param {GuildMemberResolvable} AnyMember The member you want to give some chips
 * @param {number} ChipsAmount The amount of chips you want to give
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { readCasino, writeCasino } from '@components/Typeorm/DbInteractions';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

type CustomTopUpArgs = {
  player: GuildMember;
  chips: number;
};

export default class CustomTopUpCommand extends Command {
  public constructor(client: CommandoClient) {
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
          parse: (chips: string) => roundNumber(Number(chips)),
        }
      ],
      guarded: true,
      hidden: true,
    });
  }

  public async run(msg: CommandoMessage, { player, chips }: CustomTopUpArgs) {
    const coinEmbed = new MessageEmbed()
      .setAuthor(msg.member.displayName, player.user.displayAvatarURL({ format: 'png' }))
      .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`)
      .setTitle('💰💰 HEIST! Daniël Ocean has stolen chips for you');

    let prevBal = 0;
    let newBalance = chips;

    try {
      const casino = await readCasino(player.id, msg.guild.id);

      if (casino && casino.balance !== undefined) {
        prevBal = casino.balance;
        newBalance = prevBal + chips;
      }

      await writeCasino({
        userId: player.id,
        guildId: msg.guild.id,
        balance: newBalance,
      });

      coinEmbed
        .addField('Previous Balance', prevBal, true)
        .addField('New Balance', newBalance, true);

      deleteCommandMessages(msg, this.client);

      return msg.embed(coinEmbed);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`customtopup\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Player:** ${player.user.tag} (${player.id})
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