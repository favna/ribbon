/**
 * @file Moderation UnlockCommand - Unlock the channel
 * Only really useful if you previously locked the channel
 *
 * Note that Ribbon does need to be able to be able to access this channel to unlock it (read permissions)
 *
 * **Aliases**: `delock`, `ul`
 * @module
 * @category moderation
 * @name unlock
 */

import { oneLine } from 'common-tags';
import { GuildChannel, MessageEmbed, Role, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import {
    deleteCommandMessages,
    modLogMessage,
    startTyping,
    stopTyping,
} from '../../components';

export default class UnlockCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'unlock',
            aliases: ['delock', 'ul'],
            group: 'moderation',
            memberName: 'unlock',
            description: 'Unlocks the current channel',
            examples: ['unlock'],
            guildOnly: true,
            clientPermissions: ['ADMINISTRATOR'],
            userPermissions: ['ADMINISTRATOR'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'lockrole',
                    prompt: 'Which role to apply the lockdown to?',
                    type: 'role',
                    default: 'everyone',
                },
            ],
        });
    }

    public async run(
        msg: CommandoMessage,
        { lockrole }: { lockrole: Role | any }
    ) {
        startTyping(msg);
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const channel = msg.channel as GuildChannel;
        const overwrite = await channel.overwritePermissions({
            permissionOverwrites: [
                {
                    allow: ['SEND_MESSAGES'],
                    id: msg.guild.roles.find(n =>
                        lockrole === 'everyone'
                            ? n.name === '@everyone'
                            : n.name === lockrole.name
                    ).id,
                },
            ],
            reason: 'Channel Lockdown',
        });
        const unlockEmbed = new MessageEmbed();

        unlockEmbed
            .setColor('#359876')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(
                oneLine`**Action:** 🔓 unlocked the \`${channel.name}\` channel.
                This channel can now be used by everyone again. Use \`${
                    msg.guild.commandPrefix
                }lockdown\` in this channel to (re)-lock it.`
            )
            .setTimestamp();

        if (overwrite) {
            if (msg.guild.settings.get('modlogs', true)) {
                modLogMessage(
                    msg,
                    msg.guild,
                    modlogChannel,
                    msg.guild.channels.get(modlogChannel) as TextChannel,
                    unlockEmbed
                );
            }
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(unlockEmbed);
        }
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('an error occurred unlocking this channel');
    }
}
