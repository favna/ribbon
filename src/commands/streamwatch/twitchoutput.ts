/**
 * @file Streamwatch TwitchOutputCommand - Configures the channel in which twitch notifications are send
 *
 * **Aliases**: `output`, `twitchout`, `twitchchannel`
 * @module
 * @category streamwatch
 * @name twitchoutput
 * @example twitchoutput #twitch-notifications
 * @param {ChannelResolvable} AnyChannel Channel to output notifs to
 */

import { deleteCommandMessages, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { TextChannel } from 'discord.js';

interface TwitchOutputArgs {
  channel: TextChannel;
}

export default class TwitchOutputCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'twitchoutput',
      aliases: [ 'output', 'twitchout', 'twitchchannel' ],
      group: 'streamwatch',
      memberName: 'twitchoutput',
      description: 'Configures where Twitch Notifications are send to',
      format: 'ChannelID|ChannelName(partial or full)',
      examples: [ 'twitchoutput twitch' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'channel',
          prompt: 'What channel should I set for twitch notifications? (make sure to start with a # when going by name)',
          type: 'channel',
        }
      ],
    });
  }

  @shouldHavePermission('ADMINISTRATOR')
  public async run(msg: CommandoMessage, { channel }: TwitchOutputArgs) {
    msg.guild.settings.set('twitchchannel', channel.id);
    deleteCommandMessages(msg, this.client);

    return msg.reply(`📹 the channel to use for the twitch notifications has been set to <#${channel.id}>`);
  }
}