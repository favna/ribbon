/**
 * @file Moderation ConfigureMuteCommand - Configure which role to use as "mute" role
 *
 * **Aliases**: `cm`, `configmute`
 * @module
 * @category moderation
 * @name confmute
 * @example confmute mute
 * @param {RoleResolvable} Role Role to set as mute role
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Role, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import {
    deleteCommandMessages,
    modLogMessage,
    startTyping,
    stopTyping,
} from '../../components';

export default class ConfigureMuteCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'confmute',
            aliases: ['cm', 'configmute'],
            group: 'moderation',
            memberName: 'confmute',
            description: 'Configure which role to use as "mute" role',
            format: 'RoleResolvable',
            examples: ['confmute mute'],
            guildOnly: true,
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'role',
                    prompt: 'Which role should be set as the mute role?',
                    type: 'role',
                },
            ],
        });
    }

    public run(msg: CommandoMessage, { role }: { role: Role }) {
        startTyping(msg);

        const confMuteEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        msg.guild.settings.set('muterole', role.id);

        confMuteEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(
                stripIndents`
                **Action:** Configured mute role to \`${role.name}\``
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(
                msg,
                msg.guild,
                modlogChannel,
                msg.guild.channels.get(modlogChannel) as TextChannel,
                confMuteEmbed
            );
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(confMuteEmbed);
    }
}
