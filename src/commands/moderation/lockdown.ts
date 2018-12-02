/**
 * @file Moderation LockdownCommand - Lockdown a channel  
 * Once locked it will be locked to the `@everyone` or whichever role you specified.  
 * Depending on your permissions setup it may be that only people with the `administrator` role will have access to the channel.  
 * This may also mean that Ribbon won't have access if it doesn't have administrator role so you cannot use the `unlock` command until you give it that permission!  
 * **Aliases**: `lock`, `ld`
 * @module
 * @category moderation
 * @name lockdown
 */

import { stripIndents } from 'common-tags';
import { GuildChannel, MessageEmbed, Role, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components';

export default class LockdownCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'lockdown',
      aliases: [ 'lock', 'ld' ],
      group: 'moderation',
      memberName: 'lockdown',
      description: 'Locks the current channel to just staff',
      details: stripIndents`Once locked it will be locked to the \`@everyone\` or whichever role you specified.
      Depending on your permissions setup, it may be that only people with the \`administrator\` role will have access to the channel.
      This may also mean that Ribbon won't have access if it doesn't have administrator role so you cannot use the \`unlock\` command until you give it that permission!`,
      examples: [ 'lockdown' ],
      guildOnly: true,
      clientPermissions: [ 'ADMINISTRATOR' ],
      userPermissions: [ 'ADMINISTRATOR' ],
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'lockrole',
          prompt: 'Which role to apply the lockdown to?',
          type: 'role',
          default: 'everyone',
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, { lockrole }: {lockrole: Role|any}) {
    startTyping(msg);
    const lockEmbed = new MessageEmbed();
    const channel = msg.channel as GuildChannel;
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);
    const overwrite = await channel.overwritePermissions({
      permissionOverwrites: [
          {
            allow: [ 'SEND_MESSAGES', 'VIEW_CHANNEL' ],
            id: msg.member.roles.highest.id,
          },
          {
            deny: [ 'SEND_MESSAGES' ],
            id: msg.guild.roles.find(n => lockrole === 'everyone' ? n.name === '@everyone' : n.name === lockrole.name).id,
          }
        ],
      reason: 'Channel Lockdown',
      });

    lockEmbed
      .setColor('#983553')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`
      **Action:** 🔒 locked the \`${channel.name}\` channel.
      **Details:** Only staff can now access this channel. Use \`${msg.guild.commandPrefix}unlock\` in this channel to unlock the channel`)
      .setTimestamp();

    if (overwrite) {
      if (msg.guild.settings.get('modlogs', true)) {
        modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, lockEmbed);
      }
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(lockEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('an error occurred locking this channel');
  }
}