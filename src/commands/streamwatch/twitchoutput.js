/**
 * @file Streamwatch TwitchOutputCommand - Configures the channel in which twitch notifications are send  
 * **Aliases**: `output`, `twitchout`, `twitchchannel`
 * @module
 * @category streamwatch
 * @name twitchoutput
 * @example twitchoutput #twitch-notifications
 * @param {ChannelResolvable} AnyChannel Channel to output notifs to
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {oneLine} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TwitchOutputCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'twitchoutput',
      memberName: 'twitchoutput',
      group: 'streamwatch',
      aliases: ['output', 'twitchout', 'twitchchannel'],
      description: 'Configures where Twitch Notifications are send to',
      format: 'ChannelID|ChannelName(partial or full)',
      examples: ['twitchoutput twitch'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'channel',
          prompt: 'What channel should I set for twitch notifications? (make sure to start with a # when going by name)',
          type: 'channel'
        }
      ],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg, {channel}) {
    startTyping(msg);
    msg.guild.settings.set('twitchchannel', channel.id);
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`📹 the channel to use for the twitch notifications has been set to <#${channel.id}>`);
  }
};