/**
 * @file Automod SlowmodeCommand - Toggle slowmode on this server
 *
 * **Aliases**: `slowdown`
 * @module
 * @category automod
 * @name slowmode
 * @example slowmode enable
 * @param {boolean} Option True or False
 * @param {number} [Within] Optional: Boundaries for slowmode
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components';

export default class SlowmodeCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'slowmode',
            aliases: ['slowdown'],
            group: 'automod',
            memberName: 'slowmode',
            description: 'Toggle the server invites filter',
            format: 'Option [Within]',
            examples: ['slowmode enable'],
            guildOnly: true,
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'option',
                    prompt: 'Enable or disable the server invites filter?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                },
                {
                    key: 'within',
                    prompt: 'Within how many seconds should duplicate messages be checked?',
                    type: 'integer',
                    default: 10,
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { option, within }: { option: boolean; within: number }) {
        startTyping(msg);

        const slEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const options = { within, enabled: option };

        msg.guild.settings.set('slowmode', options);

        slEmbed
            .setColor('#439DFF')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** Slowmode has been ${option ? 'enabled' : 'disabled'}
                ${option ? `**Info:** Slow mode enabled. Members can 1 message per ${within} second(s)` : ''}
                ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, slEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(slEmbed);
    }
}
