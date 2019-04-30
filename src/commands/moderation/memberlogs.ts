/**
 * @file Moderation MemberLogsCommand - Toggle member logs in the configured channel
 *
 * **Aliases**: `tml`, `togglemember`, `togglememberlogs`
 * @module
 * @category moderation
 * @name memberlogs
 * @example memberlogs enable
 * @param {boolean} Option True or False
 * @param {TextChannel} [Channel] TextChannel the Member Logs are sent to, required when enabling
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

type MemberLogsArgs = {
    shouldEnable: boolean;
    msgChannel: TextChannel | string;
};

export default class MemberLogsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'memberlogs',
            aliases: ['tml', 'togglemember', 'togglememberlogs'],
            group: 'moderation',
            memberName: 'memberlogs',
            description: 'Toggle member logs in the configured channel',
            format: 'boolean',
            examples: ['memberlogs enable'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'shouldEnable',
                    prompt: 'Enable or disable memberlogs?',
                    type: 'validboolean',
                },
                {
                    key: 'channel',
                    prompt: 'In which channel should I output memberlogs?',
                    type: 'channel',
                    default: 'off',
                }
            ],
        });
    }

    @shouldHavePermission('ADMINISTRATOR')
    public run (msg: CommandoMessage, { shouldEnable, msgChannel }: MemberLogsArgs) {
        try {
            if (shouldEnable && msgChannel === 'off') {
                return msg.reply('when activating join messages you need to provide a channel for me to output the messages to!');
            }

            if (!this.isChannel(msgChannel)) throw new Error('not_a_channel');

            const memberLogsEmbed = new MessageEmbed();
            const description = shouldEnable
                ? '📥 Ribbon memberlogs have been enabled'
                : '📤 Ribbon memberlogs have been disabled';
            const modlogChannel = msg.guild.settings.get('modlogchannel', null);

            msg.guild.settings.set('memberlogs', shouldEnable);
            msg.guild.settings.set('memberlogchannel', msgChannel.id);

            memberLogsEmbed
                .setColor('#3DFFE5')
                .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
                .setDescription(stripIndents`
                    **Action:** ${description}
                    ${shouldEnable ? `**Channel:** <#${msgChannel.id}>` : ''}`
                )
                .setTimestamp();

            if (msg.guild.settings.get('modlogs', true)) {
                logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, memberLogsEmbed);
            }

            deleteCommandMessages(msg, this.client);

            return msg.embed(memberLogsEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            if (/(?:not_a_channel)/i.test(err.toString())) {
                return msg.reply(oneLine`an error occurred setting the join message channel;.
                    I was unable to find a channel matching your input \`${msgChannel}\``);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`memberlogs\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author!.tag} (${msg.author!.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }

    private isChannel (channel: TextChannel | string): channel is TextChannel {
        return (channel as TextChannel).id !== undefined;
    }
}
