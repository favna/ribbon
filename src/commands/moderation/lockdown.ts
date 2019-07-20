/**
 * @file Moderation LockdownCommand - Lockdown a channel
 *
 * Once locked it will be locked to the `@everyone` or whichever role you specified.
 *
 * Depending on your permissions setup it may be that only people with the `administrator` role will have access to the
 *     channel.
 *
 * This may also mean that Ribbon won't have access if it doesn't have administrator role so you cannot use the
 *     `unlock` command until you give it that permission!
 *
 * **Aliases**: `lock`, `ld`
 * @module
 * @category moderation
 * @name lockdown
 * @param {RoleResolvable} [LockRole] Optional: A role the lockdown is applied to, defaults to @everyone
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, Role, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

type LockdownArgs = {
  lockrole: Role | string;
};

export default class LockdownCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'lockdown',
      aliases: [ 'lock', 'ld' ],
      group: 'moderation',
      memberName: 'lockdown',
      description: 'Locks the current channel to just staff',
      details: stripIndents`
                Once locked it will be locked to the \`@everyone\` or whichever role you specified.
                Depending on your permissions setup, it may be that only people with the \`administrator\` role will have access to the channel.
                This may also mean that Ribbon won't have access if it doesn't have administrator role so you cannot use the \`unlock\` command until you give it that permission!
              `,
      examples: [ 'lockdown' ],
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
  public async run(msg: CommandoMessage, { lockrole }: LockdownArgs) {
    try {
      const lockEmbed = new MessageEmbed();
      const channel = msg.channel as TextChannel;
      const modlogChannel = msg.guild.settings.get('modlogchannel', null);
      const overwrite = await channel.overwritePermissions({
        permissionOverwrites: [
          {
            allow: [ 'SEND_MESSAGES', 'VIEW_CHANNEL' ],
            id: msg.member.roles.highest.id,
          },
          {
            deny: [ 'SEND_MESSAGES' ],
            id: msg.guild.roles.find(n => this.isRole(lockrole)
              ? n.name === lockrole.name
              : n.name === '@everyone')!.id,
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
          logModMessage(
            msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, lockEmbed
          );
        }
        deleteCommandMessages(msg, this.client);

        return msg.embed(lockEmbed);
      }
      deleteCommandMessages(msg, this.client);

      return msg.reply('an error occurred locking this channel');
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`defaultrole\` command!
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

  private isRole(role: Role | string): role is Role {
    return (role as Role).id !== undefined;
  }
}