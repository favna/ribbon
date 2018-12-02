/**
 * @file Moderation MemberLogsCommand - Toggle member logs in the configured channel  
 * **Aliases**: `tml`, `togglemember`, `togglememberlogs`
 * @module
 * @category moderation
 * @name memberlogs
 * @example memberlogs enable
 * @param {BooleanResolvable} Option True or False
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components';

export default class MemberLogsCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'memberlogs',
      aliases: [ 'tml', 'togglemember', 'togglememberlogs' ],
      group: 'moderation',
      memberName: 'memberlogs',
      description: 'Toggle member logs in the member-logs (or by you configured with setmemberlogs) channel',
      format: 'BooleanResolvable',
      examples: [ 'memberlogs enable' ],
      guildOnly: true,
      userPermissions: [ 'ADMINISTRATOR' ],
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable memberlogs?',
          type: 'boolean',
          validate: (bool: boolean) => validateBool(bool),
        },
        {
          key: 'channel',
          prompt: 'In which channel should I output memberlogs?',
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

    const memberLogsEmbed = new MessageEmbed();
    const description = option ? '📥 Ribbon memberlogs have been enabled' : '📤 Ribbon memberlogs have been disabled';
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);

    msg.guild.settings.set('memberlogs', option);
    msg.guild.settings.set('memberlogchannel', channel.id);

    memberLogsEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
        **Action:** ${description}
        ${option ? `**Channel:** <#${channel.id}>` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, memberLogsEmbed);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(memberLogsEmbed);
  }
}