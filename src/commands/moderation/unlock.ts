/**
 * @file Moderation UnlockCommand - Unlock the channel
 * Only really useful if you previously locked the channel
 *
 * Note that Ribbon does need to be able to be able to access this channel to unlock it (read permissions)
 *
 * **Aliases**: `delock`, `ul`
 * @module
 * @category moderation
 * @name unlock
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildChannel, MessageEmbed, Role, TextChannel } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

interface UnlockArgs {
  lockrole: Role | string;
}

export default class UnlockCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'unlock',
      aliases: [ 'delock', 'ul' ],
      group: 'moderation',
      memberName: 'unlock',
      description: 'Unlocks the current channel',
      examples: [ 'unlock' ],
      guildOnly: true,
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

  @shouldHavePermission('ADMINISTRATOR', true)
  public async run(msg: CommandoMessage, { lockrole }: UnlockArgs) {
    try {
      const modlogChannel = msg.guild.settings.get('modlogchannel', null);
      const channel = msg.channel as GuildChannel;
      const overwrite = await channel.overwritePermissions({
        permissionOverwrites: [
          {
            allow: [ 'SEND_MESSAGES' ],
            id: msg.guild.roles.find(n => this.isRole(lockrole)
              ? n.name === lockrole.name
              : n.name === '@everyone')!.id,
          }
        ],
        reason: 'Channel Lockdown',
      });
      const unlockEmbed = new MessageEmbed();

      unlockEmbed
        .setColor('#359876')
        .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
        .setDescription(stripIndents`
          **Action:** 🔓 unlocked the \`${channel.name}\` channel.
          **Details:** This channel can now be used by everyone again. Use \`${msg.guild.commandPrefix}lockdown\` in this channel to (re)-lock it.`)
        .setTimestamp();

      if (overwrite) {
        if (msg.guild.settings.get('modlogs', true)) {
          logModMessage(
            msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, unlockEmbed
          );
        }
        deleteCommandMessages(msg, this.client);

        return msg.embed(unlockEmbed);
      }
      deleteCommandMessages(msg, this.client);

      return msg.reply('an error occurred unlocking this channel');
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`defaultrole\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author!.tag} (${msg.author!.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }

  private isRole(role: Role | string): role is Role {
    return (role as Role).id !== undefined;
  }
}