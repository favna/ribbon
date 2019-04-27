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

import { deleteCommandMessages, logModMessage, shouldHavePermission, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

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
                    key: 'option',
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
    public run (msg: CommandoMessage, { channel, option }: { channel: TextChannel | any; option: boolean }) {
        if (option && channel === 'off') {
            return msg.reply('when activating join messages you need to provide a channel for me to output the messages to!');
        }

        startTyping(msg);

        const memberLogsEmbed = new MessageEmbed();
        const description = option
            ? '📥 Ribbon memberlogs have been enabled'
            : '📤 Ribbon memberlogs have been disabled';
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        msg.guild.settings.set('memberlogs', option);
        msg.guild.settings.set('memberlogchannel', channel.id);

        memberLogsEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** ${description}
                ${option ? `**Channel:** <#${channel.id}>` : ''}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, memberLogsEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(memberLogsEmbed);
    }
}
