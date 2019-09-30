/**
 * @file Streamwatch TwitchToggleCommand - Killswitch for Twitch notifications
 *
 * **Aliases**: `twitchon`, `twitchoff`
 * @module
 * @category streamwatch
 * @name twitchtoggle
 * @example twitchtoggle enable
 * @param {boolean} Option True or False
 */

import { deleteCommandMessages, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { oneLine } from 'common-tags';

interface TwitchToggleArgs {
  shouldEnable: boolean;
}

export default class TwitchToggleCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'twitchtoggle',
      aliases: [ 'twitchon', 'twitchoff' ],
      group: 'streamwatch',
      memberName: 'twitchtoggle',
      description: 'Configures whether Twitch Notifications are enabled',
      format: 'boolean',
      details: 'This is a killswitch for the entire module!',
      examples: [ 'twitchtoggle enable' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'shouldEnable',
          prompt: 'Enable or disable twitch monitoring?',
          type: 'validboolean',
        }
      ],
    });
  }

  @shouldHavePermission('ADMINISTRATOR')
  public async run(msg: CommandoMessage, { shouldEnable }: TwitchToggleArgs) {
    msg.guild.settings.set('twitchnotifiers', shouldEnable);

    deleteCommandMessages(msg, this.client);

    return msg.reply(oneLine`
      Twitch Notifiers have been
      ${shouldEnable
    ? `enabled. Please make sure to set the output channel with \`${msg.guild.commandPrefix}twitchoutput\`and configure which users to monitor with \`${msg.guild.commandPrefix}twitchmonitors\``
    : 'disabled.'
}.`);
  }
}