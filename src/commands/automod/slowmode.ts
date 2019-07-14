/**
 * @file Automod SlowmodeCommand - Toggle slowmode on this server
 *
 * **Aliases**: `slowdown`
 * @module
 * @category automod
 * @name slowmode
 * @example slowmode enable
 * @param {boolean} Option True or False
 * @param {number} [Within] Optional: Boundaries for slowmode
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type SlowmodeArgs = {
  shouldEnable: boolean;
  within: number;
};

export default class SlowmodeCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'slowmode',
      aliases: [ 'slowdown' ],
      group: 'automod',
      memberName: 'slowmode',
      description: 'Toggle the server invites filter',
      format: 'Option [Within]',
      examples: [ 'slowmode enable' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'shouldEnable',
          prompt: 'Enable or disable the server invites filter?',
          type: 'validboolean',
        },
        {
          key: 'within',
          prompt: 'Within how many seconds should duplicate messages be checked?',
          type: 'integer',
          default: 10,
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES', true)
  public async run(msg: CommandoMessage, { shouldEnable, within }: SlowmodeArgs) {
    const slEmbed = new MessageEmbed();
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);
    const options = { within, enabled: shouldEnable };

    msg.guild.settings.set('slowmode', options);

    slEmbed
      .setColor('#439DFF')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
      .setDescription(stripIndents`
        **Action:** Slowmode has been ${shouldEnable ? 'enabled' : 'disabled'}
        ${shouldEnable ? `**Info:** Slow mode enabled. Members can 1 message per ${within} second(s)` : ''}
        ${msg.guild.settings.get('automod', false) ? '' : `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!`}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      logModMessage(
        msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, slEmbed
      );
    }

    deleteCommandMessages(msg, this.client);

    return msg.embed(slEmbed);
  }
}