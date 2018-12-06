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

import { TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class TwitchOutputCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'twitchoutput',
            aliases: ['output', 'twitchout', 'twitchchannel'],
            group: 'streamwatch',
            memberName: 'twitchoutput',
            description: 'Configures where Twitch Notifications are send to',
            format: 'ChannelID|ChannelName(partial or full)',
            examples: ['twitchoutput twitch'],
            guildOnly: true,
            userPermissions: ['ADMINISTRATOR'],
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

    public run (msg: CommandoMessage, { channel }: { channel: TextChannel }) {
        startTyping(msg);
        msg.guild.settings.set('twitchchannel', channel.id);
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply(`📹 the channel to use for the twitch notifications has been set to <#${channel.id}>`
        );
    }
}
