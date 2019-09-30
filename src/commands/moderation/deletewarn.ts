/**
 * @file Moderation DeleteWarnCommand - Deletes all or some warnings points from a user
 *
 * **Aliases**: `removewarn`, `unwarn`, `dw`, `uw`
 * @module
 * @category moderation
 * @name deletewarn
 * @example deletewarn favna
 * @example deletewarn favna
 * @param {MemberResolvable} AnyMember The member to remove warning points from
 * @param {number} [AmountOfWarnPoints] The amount of warning points to remove
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readWarning, updateWarning } from '@components/Typeorm/DbInteractions';

interface DeleteWarnArgs {
  member: GuildMember;
  points: number;
}

export default class DeleteWarnCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'deletewarn',
      aliases: [ 'removewarn', 'unwarn', 'dw', 'uw' ],
      group: 'moderation',
      memberName: 'deletewarn',
      description: 'Deletes all or some warnings points from a user',
      format: 'MemberID|MemberName(partial or full) [AmountOfWarnPoints]',
      examples: [ 'deletewarn favna', 'deletewarn favna 5' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'Which member should I remove warning points from?',
          type: 'member',
        },
        {
          key: 'points',
          prompt: 'How many warning points should I remove from this member?',
          type: 'integer',
          default: 999999,
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES')
  public async run(msg: CommandoMessage, { member, points }: DeleteWarnArgs) {
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);
    const warnEmbed = new MessageEmbed()
      .setColor('#FFFF00')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
      .setTimestamp();

    try {
      const warning = await readWarning(member.id, msg.guild.id);

      if (!warning || !warning.points) return msg.reply('that user has no warnings points yet');

      const previousPoints = warning.points;
      let newPoints = points === 999999 ? 0 : warning.points - points;

      if (newPoints < 0) newPoints = 0;

      await updateWarning({
        userId: member.id,
        guildId: msg.guild.id,
        tag: member.user.tag,
        points: newPoints,
      });

      warnEmbed.setDescription(stripIndents`
        **Member:** ${member.user.tag} (${member.id})
        **Action:** Removed Warnings
        **Previous Warning Points:** ${previousPoints}
        **Current Warning Points:** ${newPoints}`
      );

      if (msg.guild.settings.get('modlogs', true)) {
        logModMessage(
          msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, warnEmbed
        );
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(warnEmbed);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`deletewarn\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author!.tag} (${msg.author!.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** \`${member.user.tag} (${member.id})\`|| \`${points}\`
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