/**
 * @file Moderation DefaultroleCommand - Sets a default role that should be assigned to all new joining members  
 * **Aliases**: `defrole`
 * @module
 * @category moderation
 * @name defaultrole
 * @example defaultrole Member
 * @param {RoleResolvable} AnyRole Role to assign to all new joining members
 */

import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, Role, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components';

export default class DefaultroleCommand extends Command {
  constructor (client: CommandoClient) {
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
      clientPermissions: [ 'MANAGE_ROLES' ],
      userPermissions: [ 'MANAGE_ROLES' ],
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

  public run (msg: CommandoMessage, { role }: {role: Role|any}) {
    startTyping(msg);
    const defRoleEmbed = new MessageEmbed();
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);

    let description = oneLine`🔓 \`${role.name}\` has been set as the default role for this server and will now be granted to all people joining`;

    if (role === 'delete') {
      msg.guild.settings.remove('defaultRole');
      description = 'Default role has been removed';
    } else {
      msg.guild.settings.set('defaultRole', role.id);
    }

    defRoleEmbed
      .setColor('#AAEFE6')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** ${description}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, defRoleEmbed);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(defRoleEmbed);
  }
}