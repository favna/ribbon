/**
 * @file Automod InvitesFilterCommand - Toggle the Discord server invites filter
 *
 * **Aliases**: `if`, `noinvites`
 * @module
 * @category automod
 * @name invitesfilter
 * @example invitesfilter enable
 * @param {boolean} Option True or False
 */

import { deleteCommandMessages, logModMessage, startTyping, stopTyping, validateBool, validatePermissions } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

export default class InvitesFilterCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'invitesfilter',
            aliases: ['if', 'noinvites'],
            group: 'automod',
            memberName: 'invitesfilter',
            description: 'Toggle the Discord server invites filter',
            format: 'boolean',
            examples: ['invitesfilter enable'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'option',
                    prompt: 'Enable or disable the external links filter?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                }
            ],
        });
    }

    public hasPermission = (msg: CommandoMessage) => validatePermissions('MANAGE_MESSAGES', msg, this.client);

    public run (msg: CommandoMessage, { option }: { option: boolean }) {
        startTyping(msg);

        const ifEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        msg.guild.settings.set('invites', option);

        ifEmbed
            .setColor('#439DFF')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** Discord Server invites filter has been ${option ? 'enabled' : 'disabled'}
                ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, ifEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(ifEmbed);
    }
}
