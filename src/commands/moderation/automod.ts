/**
 * @file Moderation AutomodCommand - General toggle for all automod features  
 * **Aliases**: `botmod`, `skynetmod`  
 * @module
 * @category moderation
 * @name automod
 * @example automod enable
 * @param {BooleanResolvable} Option True or False
 * @param {RoleResolvable} [Roles] Roles that are exempted from automod
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Role, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components/util';

export default class AutomodCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'automod',
      aliases: [ 'botmod', 'skynetmod' ],
      group: 'moderation',
      memberName: 'automod',
      description: 'General toggle for all automod features',
      format: 'BooleanResolvable [RoleResolvable(s)]',
      examples: [ 'automod enable' ],
      guildOnly: true,
      clientPermissions: [ 'MANAGE_MESSAGES' ],
      userPermissions: [ 'MANAGE_MESSAGES' ],
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable Unknown Command messages?',
          type: 'boolean',
          validate: (bool: boolean) => validateBool(bool),
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

  public run (msg: CommandoMessage, { option, roles }: {option: boolean, roles: Array<Role>}) {
    startTyping(msg);

    const automodEmbed = new MessageEmbed();
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);
    const options = {
        enabled: option,
        filterroles: roles ? roles.map(r => r.id) : [],
      };

    msg.guild.settings.set('automod', options);

    automodEmbed
      .setColor('#3DFFE5')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** Automod features are now ${option ? 'enabled' : 'disabled'}
      **Notice:** Be sure to enable your desired individual features, they are all off by default!
      ${roles ? `**Roles exempted from automod**: ${roles.map(val => `\`${val.name}\``).join(', ')}` : ''}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, automodEmbed);
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(automodEmbed);
  }
}