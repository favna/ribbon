/**
 * @file Moderation LeaveMessagesCommand - Toggle whether Ribbon should send special leave messages when members leave
 *
 * **Aliases**: `lmt`, `leavemessagestoggle`
 * @module
 * @category moderation
 * @name leavemessages
 * @example leavemessages enable
 * @param {boolean} Option True or False
 * @param {TextChannel} [Channel] TextChannel the Leave Message is sent to, required when enabling
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

type LeaveMessagesArgs = {
  shouldEnable: boolean;
  msgChannel: TextChannel | string;
};

export default class LeaveMessagesCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'leavemessages',
      aliases: [ 'lmt', 'leavemessagestoggle' ],
      group: 'moderation',
      memberName: 'leavemessages',
      description: 'Toggle whether Ribbon should send special leave messages when members leave',
      format: 'boolean  [Channel]',
      examples: [ 'leavemessages enable' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'shouldEnable',
          prompt: 'Enable or disable leave messages?',
          type: 'validboolean',
        },
        {
          key: 'msgChannel',
          prompt: 'In which channel should I wave people goodbye?',
          type: 'channel',
          default: 'off',
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES')
  public async run(msg: CommandoMessage, { shouldEnable, msgChannel }: LeaveMessagesArgs) {
    try {
      if (shouldEnable && msgChannel === 'off') {
        return msg.reply('when activating join messages you need to provide a channel for me to output the messages to!');
      }

      const description = shouldEnable
        ? '📉 Ribbon leave messages have been enabled'
        : '📉 Ribbon leave messages have been disabled';
      const modlogChannel = msg.guild.settings.get('modlogchannel', null);
      const leaveMsgEmbed = new MessageEmbed()
        .setColor('#AAEFE6')
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(`**Action:** ${description}`)
        .setTimestamp();

      msg.guild.settings.set('leavemsgs', shouldEnable);

      if (this.isChannel(msgChannel)) {
        msg.guild.settings.set('leavemsgchannel', msgChannel.id);
        leaveMsgEmbed.description += `\n${shouldEnable ? `**Channel:** <#${msgChannel.id}>` : ''}`;
      }

      if (msg.guild.settings.get('modlogs', true)) {
        logModMessage(
          msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, leaveMsgEmbed
        );
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(leaveMsgEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`joinmessafes\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }

  private isChannel(channel: TextChannel | string): channel is TextChannel {
    return (channel as TextChannel).id !== undefined;
  }
}