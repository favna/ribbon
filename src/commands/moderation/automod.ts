/**
 * @file Moderation AutomodCommand - General toggle for all automod features
 *
 * **Aliases**: `botmod`, `skynetmod`
 * @module
 * @category moderation
 * @name automod
 * @example automod enable
 * @param {boolean} Option True or False
 * @param {RoleResolvable} [Roles] Roles that are exempted from automod
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, Role, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type AutomodArgs = {
  shouldEnable: boolean;
  roles: Role[];
};

export default class AutomodCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'automod',
      aliases: [ 'botmod', 'skynetmod' ],
      group: 'moderation',
      memberName: 'automod',
      description: 'General toggle for all automod features',
      format: 'boolean [RoleResolvable(s)]',
      examples: [ 'automod enable' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'shouldEnable',
          prompt: 'Enable or disable Unknown Command messages?',
          type: 'validboolean',
        },
        {
          key: 'roles',
          prompt: 'What roles, if any, should be exempt from automod? End with `finish` when you replied all role names (if any)',
          type: 'role',
          default: '',
          infinite: true,
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES', true)
  public async run(msg: CommandoMessage, { shouldEnable, roles }: AutomodArgs) {
    const automodEmbed = new MessageEmbed();
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);
    const options = {
      enabled: shouldEnable,
      filterroles: roles ? roles.map(r => r.id) : [],
    };

    msg.guild.settings.set('automod', options);

    automodEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
      .setDescription(stripIndents`
        **Action:** Automod features are now ${shouldEnable ? 'enabled' : 'disabled'}
        **Notice:** Be sure to enable your desired individual features, they are all off by default!
        ${roles ? `**Roles exempted from automod**: ${roles.map(val => `\`${val.name}\``).join(', ')}` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      logModMessage(
        msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, automodEmbed
      );
    }

    deleteCommandMessages(msg, this.client);

    return msg.embed(automodEmbed);
  }
}