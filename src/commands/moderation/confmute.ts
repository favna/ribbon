/**
 * @file Moderation ConfigureMuteCommand - Configure which role to use as "mute" role
 *
 * **Aliases**: `cm`, `configmute`
 * @module
 * @category moderation
 * @name confmute
 * @example confmute mute
 * @param {RoleResolvable} Role Role to set as mute role
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, Role, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type ConfigureMuteArgs = {
  role: Role;
};

export default class ConfigureMuteCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'confmute',
      aliases: [ 'cm', 'configmute' ],
      group: 'moderation',
      memberName: 'confmute',
      description: 'Configure which role to use as "mute" role',
      format: 'RoleResolvable',
      examples: [ 'confmute mute' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'role',
          prompt: 'Which role should be set as the mute role?',
          type: 'role',
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_ROLES', true)
  public async run(msg: CommandoMessage, { role }: ConfigureMuteArgs) {
    const confMuteEmbed = new MessageEmbed();
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);

    msg.guild.settings.set('muterole', role.id);

    confMuteEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
      .setDescription(stripIndents`
        **Action:** Configured mute role to \`${role.name}\``)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      logModMessage(
        msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, confMuteEmbed
      );
    }

    deleteCommandMessages(msg, this.client);

    return msg.embed(confMuteEmbed);
  }
}