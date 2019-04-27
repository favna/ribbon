/**
 * @file Moderation ModLogsCommand - Toggle mod logs in the configured channel
 *
 * **Aliases**: `togglemod`
 * @module
 * @category moderation
 * @name modlogs
 * @example modlogs enable
 * @param {boolean} Option True or False
 * @param {TextChannel} [Channel] TextChannel the Mod Logs are sent to, required when enabling
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

export default class ModLogsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'modlogs',
            aliases: ['togglemod'],
            group: 'moderation',
            memberName: 'modlogs',
            description: 'Toggle mod logs in the configured channel',
            format: 'boolean',
            examples: ['modlogs {option}', 'modlogs enable'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'option',
                    prompt: 'Enable or disable modlogs?',
                    type: 'validboolean',
                },
                {
                    key: 'channel',
                    prompt: 'In which channel should I output modlogs?',
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

        const description = option
            ? '📥 Ribbon modlogs have been enabled'
            : '📤 Ribbon modlogs have been disabled';
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const modlogsEmbed = new MessageEmbed();

        msg.guild.settings.set('modlogs', option);
        msg.guild.settings.set('modlogchannel', channel.id);

        modlogsEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** ${description}
                ${option ? `**Channel:** <#${channel.id}>` : ''}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, modlogsEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(modlogsEmbed);
    }
}
