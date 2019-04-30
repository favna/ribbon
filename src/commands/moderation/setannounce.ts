/**
 * @file Moderation SetAnnounceCommand - Set the channel for the announce command
 *
 * **Aliases**: `sa`, `setannouncement`, `setannouncements`
 * @module
 * @category moderation
 * @name setannounce
 * @example setannounce #updates
 * @param {ChannelResolvable} AnnounceChannel The channel to set the announcements to
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type SetAnnounceArgs = {
    channel: TextChannel
};

export default class SetAnnounceCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'setannounce',
            aliases: ['sa', 'setannouncement', 'setannouncements'],
            group: 'moderation',
            memberName: 'setannounce',
            description: 'Set the channel for the announce command',
            format: 'ChannelID|ChannelName(partial or full)',
            examples: ['setannounce #updates'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'channel',
                    prompt: 'To what channel should I change the announcements?',
                    type: 'channel',
                }
            ],
        });
    }

    @shouldHavePermission('ADMINISTRATOR')
    public run (msg: CommandoMessage, { channel }: SetAnnounceArgs) {
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const setAnnouncementEmbed = new MessageEmbed();

        msg.guild.settings.set('announcechannel', channel.id);

        setAnnouncementEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** Announcements Channel channel changed
                **Channel:** <#${channel.id}>`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, setAnnouncementEmbed);
        }

        deleteCommandMessages(msg, this.client);

        return msg.embed(setAnnouncementEmbed);
    }
}
