/**
 * @file Moderation LeaveMessagesCommand - Toggle whether Ribbon should send special leave messages when members leave  
 * **Aliases**: `lmt`, `leavemessagestoggle`
 * @module
 * @category moderation
 * @name leavemessages
 * @example leavemessages enable
 * @param {BooleanResolvable} Option True or False
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components';

export default class LeaveMessagesCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'leavemessages',
      aliases: [ 'lmt', 'leavemessagestoggle' ],
      group: 'moderation',
      memberName: 'leavemessages',
      description: 'Toggle whether Ribbon should send special leave messages when members leave',
      format: 'BooleanResolvable  [Channel]',
      examples: [ 'leavemessages enable' ],
      guildOnly: true,
      userPermissions: [ 'MANAGE_MESSAGES' ],
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable leave messages?',
          type: 'boolean',
          validate: (bool: boolean) => validateBool(bool),
        },
        {
          key: 'channel',
          prompt: 'In which channel should I wave people goodbye?',
          type: 'channel',
          default: 'off',
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { channel, option }: {channel: TextChannel|any, option: boolean}) {
    if (option && channel === 'off') {
      return msg.reply('when activating join messages you need to provide a channel for me to output the messages to!');
    }

    startTyping(msg);
    const leaveMsgEmbed = new MessageEmbed();
    const description = option ? '📉 Ribbon leave messages have been enabled' : '📉 Ribbon leave messages have been disabled';
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);

    msg.guild.settings.set('leavemsgs', option);
    msg.guild.settings.set('leavemsgchannel', channel.id);

    leaveMsgEmbed
      .setColor('#AAEFE6')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
        **Action:** ${description}
        ${option ? `**Channel:** <#${channel.id}>` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, leaveMsgEmbed);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(leaveMsgEmbed);
  }
}