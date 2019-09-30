/**
 * @file Moderation DefaultRoleCommand - Sets a default role that should be assigned to all new joining members
 *
 * **Aliases**: `defrole`
 * @module
 * @category moderation
 * @name defaultrole
 * @example defaultrole Member
 * @param {RoleResolvable} AnyRole Role to assign to all new joining members
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, Role, TextChannel } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

interface DefaultRoleArgs {
  role: Role | string;
}

export default class DefaultRoleCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'defaultrole',
      aliases: [ 'defrole' ],
      group: 'moderation',
      memberName: 'defaultrole',
      description: 'Set a default role Ribbon will assign to any members joining after this command',
      format: 'RoleID|RoleName(partial or full)',
      details: 'Use "delete" to remove the default role',
      examples: [ 'defaultrole Member' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'role',
          prompt: 'Which role would you like to set as the default role?',
          type: 'role',
          default: 'delete',
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_ROLES', true)
  public async run(msg: CommandoMessage, { role }: DefaultRoleArgs) {
    try {
      const defRoleEmbed = new MessageEmbed();
      const modlogChannel = msg.guild.settings.get('modlogchannel', null);
      let description = '';

      if (this.isRole(role)) {
        description = oneLine`🔓 \`${role.name}\` has been set as the default role for this server and will now be granted to all people joining`;
        msg.guild.settings.set('defaultRole', role.id);
      } else if (role === 'delete') {
        msg.guild.settings.remove('defaultRole');
        description = 'Default role has been removed';
      } else {
        throw new Error('not_a_role');
      }

      defRoleEmbed
        .setColor('#AAEFE6')
        .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
        .setDescription(stripIndents`**Action:** ${description}`)
        .setTimestamp();

      if (msg.guild.settings.get('modlogs', true)) {
        logModMessage(
          msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, defRoleEmbed
        );
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(defRoleEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      if (/(?:not_a_role)/i.test(err.toString())) {
        return msg.reply(oneLine`an error occurred setting the default role.
                    I was unable to find a role matching your input \`${role}\``);
      }
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