/**
 * @file Streamwatch TwitchToggleCommand - Killswitch for Twitch notifications  
 * **Aliases**: `twitchon`, `twitchoff`
 * @module
 * @category streamwatch
 * @name twitchtoggle
 * @example twitchtoggle enable
 * @param {BooleanResolvable} Option True or False
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TwitchToggleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'twitchtoggle',
      memberName: 'twitchtoggle',
      group: 'streamwatch',
      aliases: ['twitchon', 'twitchoff'],
      description: 'Configures whether Twitch Notifications are enabled',
      details: 'This is a killswitch for the entire module!',
      format: 'BooleanResolvable',
      examples: ['twitchtoggle enable'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'option',
          prompt: 'Enable or disable twitch monitoring?',
          type: 'boolean',
          validate: (bool) => {
            const validBools = ['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+', 'false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-'];

            if (validBools.includes(bool.toLowerCase())) {
              return true;
            }

            return stripIndents`Has to be one of ${validBools.map(val => `\`${val}\``).join(', ')}
            Respond with your new selection or`;
          }
        }
      ],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg, {option}) {
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
};