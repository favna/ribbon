/**
 * @file Moderation JoinMessagesCommand - Toggle whether Ribbon should send special greeting messages when members join  
 * **Aliases**: `jmt`, `joinmessagestoggle`
 * @module
 * @category moderation
 * @name joinmessages
 * @example joinmessages enable
 * @param {BooleanResolvable} Option True or False
 * @returns {MessageEmbed} Confirmation the setting was stored
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components/util';

export default class JoinMessagesCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'joinmessages',
      aliases: [ 'jmt', 'joinmessagestoggle' ],
      group: 'moderation',
      memberName: 'joinmessages',
      description: 'Toggle whether Ribbon should send special greeting messages when members join',
      format: 'BooleanResolvable [Channel]',
      examples: [ 'joinmessages enable' ],
      guildOnly: true,
      userPermissions: [ 'MANAGE_MESSAGES' ],
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable join messages?',
          type: 'boolean',
          validate: (bool: boolean) => validateBool(bool),
        },
        {
          key: 'channel',
          prompt: 'In which channel should I greet people?',
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
    const joinMsgEmbed = new MessageEmbed();
    const description = option ? '📈 Ribbon join messages have been enabled' : '📈 Ribbon join messages have been disabled';
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);

    msg.guild.settings.set('joinmsgs', option);
    msg.guild.settings.set('joinmsgchannel', channel.id);

    joinMsgEmbed
      .setColor('#AAEFE6')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
        **Action:** ${description}
        ${option ? `**Channel:** <#${channel.id}>` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, joinMsgEmbed);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(joinMsgEmbed);
  }
}