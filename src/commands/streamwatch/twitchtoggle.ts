/**
 * @file Streamwatch TwitchToggleCommand - Killswitch for Twitch notifications  
 * **Aliases**: `twitchon`, `twitchoff`
 * @module
 * @category streamwatch
 * @name twitchtoggle
 * @example twitchtoggle enable
 * @param {BooleanResolvable} Option True or False
 */

import {oneLine} from 'common-tags';
import {Command, CommandoClient, CommandoMessage} from 'discord.js-commando';
import {deleteCommandMessages, startTyping, stopTyping, validateBool} from '../../components/util';

export default class TwitchToggleCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'twitchtoggle',
      aliases: ['twitchon', 'twitchoff'],
      group: 'streamwatch',
      memberName: 'twitchtoggle',
      description: 'Configures whether Twitch Notifications are enabled',
      format: 'BooleanResolvable',
      details: 'This is a killswitch for the entire module!',
      examples: ['twitchtoggle enable'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable twitch monitoring?',
          type: 'boolean',
          validate: (bool: boolean) => validateBool(bool),
        }
      ],
    });
  }

  public run (msg: CommandoMessage, {option}: {option: boolean}) {
    startTyping(msg);
    msg.guild.settings.set('twitchnotifiers', option);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`Twitch Notifiers have been
    ${option
    ? `enabled.
        Please make sure to set the output channel with \`${msg.guild.commandPrefix}twitchoutput\`
        and configure which users to monitor with \`${msg.guild.commandPrefix}twitchmonitors\` `
    : 'disabled.'}.`);
  }
}