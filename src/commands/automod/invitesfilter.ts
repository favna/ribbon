/**
 * @file Automod InvitesFilterCommand - Toggle the Discord server invites filter
 *
 * **Aliases**: `if`, `noinvites`
 * @module
 * @category automod
 * @name invitesfilter
 * @example invitesfilter enable
 * @param {BooleanResolvable} Option True or False
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components';

export default class InvitesFilterCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'invitesfilter',
            aliases: ['if', 'noinvites'],
            group: 'automod',
            memberName: 'invitesfilter',
            description: 'Toggle the Discord server invites filter',
            format: 'BooleanResolvable',
            examples: ['invitesfilter enable'],
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
                    prompt: 'Enable or disable the external links filter?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { option }: { option: boolean }) {
        startTyping(msg);

        const ifEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        msg.guild.settings.set('invites', option);

        ifEmbed
            .setColor('#439DFF')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`**Action:** Discord Server invites filter has been ${option ? 'enabled' : 'disabled'}
      ${!msg.guild.settings.get('automod', false) ? `**Notice:** Be sure to enable the general automod toggle with the \`${msg.guild.commandPrefix}automod\` command!` : ''}`)
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, ifEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(ifEmbed);
    }
}