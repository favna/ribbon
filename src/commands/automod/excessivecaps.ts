/**
 * @file Automod ExcessiveCapsCommand - Toggle the excessive caps filter
 *
 * **Aliases**: `spammedcaps`, `manycaps`, `caps`
 * @module
 * @category automod
 * @name excessivecaps
 * @example excessivecaps enable
 * @param {boolean} Option True or False
 * @param {string} [threshold] How much percent of a message should be caps to delete
 * @param {number} [minlength] Minimum length of message before it is checked
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type ExcessiveCapsArgs = {
  shouldEnable: boolean;
  threshold: string;
  minLength: number;
};

export default class ExcessiveCapsCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'excessivecaps',
      aliases: ['spammedcaps', 'manycaps', 'caps'],
      group: 'automod',
      memberName: 'excessivecaps',
      description: 'Toggle the excessive caps filter',
      format: 'boolean',
      examples: ['excessivecaps enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'shouldEnable',
          prompt: 'Enable or disable the Excessive Caps filter?',
          type: 'validboolean',
        },
        {
          key: 'threshold',
          prompt: 'After how much percent of caps should a message be deleted?',
          type: 'string',
          default: '60',
          validate: (t: string) => {
            if (/(?:[%])/.test(t)) {
              if (Number(t.slice(0, -1))) {
                return true;
              }
            } else if (Number(t)) {
              return true;
            }

            return 'has to be a valid percentile number in the format of `60% or `60`';
          },
          parse: (t: string) => /(?:[%])/.test(t) ? Number(t.slice(0, -1)) : Number(t),
        },
        {
          key: 'minLength',
          prompt: 'What should the minimum length of a message be before it is checked?',
          type: 'integer',
          default: 10,
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES', true)
  public run (msg: CommandoMessage, { shouldEnable, threshold, minLength }: ExcessiveCapsArgs) {
    const ecfEmbed = new MessageEmbed();
    const modlogChannel = msg.guild.settings.get('modlogchannel', null);
    const options = { minlength: minLength, threshold, enabled: shouldEnable };

    msg.guild.settings.set('caps', options);

    ecfEmbed
      .setColor('#439DFF')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
      .setDescription(stripIndents`
        **Action:** Excessive Caps filter has been ${shouldEnable ? 'enabled' : 'disabled'}
        ${shouldEnable ? `**Threshold:** Messages that have at least ${threshold}% caps will be deleted` : ''}
        ${shouldEnable ? `**Minimum length:** Messages of at least ${minLength} are checked for caps` : ''}
        ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`
      )
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, ecfEmbed);
    }

    deleteCommandMessages(msg, this.client);

    return msg.embed(ecfEmbed);
  }
}
