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

import { deleteCommandMessages, logModMessage, shouldHavePermission, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildChannel, MessageEmbed, Role, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

export default class UnlockCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'unlock',
            aliases: ['delock', 'ul'],
            group: 'moderation',
            memberName: 'unlock',
            description: 'Unlocks the current channel',
            examples: ['unlock'],
            guildOnly: true,
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
                }
            ],
        });
    }

    @shouldHavePermission('ADMINISTRATOR', true)
    public async run (msg: CommandoMessage, { lockrole }: { lockrole: Role | any }) {
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
                    )!.id,
                }
            ],
            reason: 'Channel Lockdown',
        });
        const unlockEmbed = new MessageEmbed();

        unlockEmbed
            .setColor('#359876')
            .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** 🔓 unlocked the \`${channel.name}\` channel.
                **Details:** This channel can now be used by everyone again. Use \`${msg.guild.commandPrefix}lockdown\` in this channel to (re)-lock it.`
            )
            .setTimestamp();

        if (overwrite) {
            if (msg.guild.settings.get('modlogs', true)) {
                logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, unlockEmbed);
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
