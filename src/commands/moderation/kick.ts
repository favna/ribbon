/**
 * @file Moderation KickCommand - Kicks a somewhat bad member
 *
 * **Aliases**: `k`
 * @module
 * @category moderation
 * @name kick
 * @example kick ThunderKai
 * @param {GuildMemberResolvable} AnyMember The member to kick from the server
 * @param {StringResolvable} TheReason Reason for this kick.
 */

import { stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components';

export default class KickCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'kick',
            aliases: ['k'],
            group: 'moderation',
            memberName: 'kick',
            description: 'Kicks a member from the server',
            format: 'MemberID|MemberName(partial or full) [ReasonForKicking]',
            examples: ['kick JohnDoe annoying'],
            guildOnly: true,
            clientPermissions: ['KICK_MEMBERS'],
            userPermissions: ['KICK_MEMBERS'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Which member do you want me to kick?',
                    type: 'member',
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason for this kick?',
                    type: 'string',
                    default: '',
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { member, reason }: { member: GuildMember; reason: string }) {
        if (member.id === msg.author.id) return msg.reply('I don\'t think you want to kick yourself.');
        if (!member.kickable) return msg.reply('I cannot kick that member, their role is probably higher than my own!');
        startTyping(msg);

        member.kick(reason !== '' ? reason : 'No reason given by staff');
        const kickEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        kickEmbed
            .setColor('#FF8300')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                **Member:** ${member.user.tag} (${member.id})
                **Action:** Kick
                **Reason:** ${reason !== '' ? reason : 'No reason given by staff'}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, kickEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(kickEmbed);
    }
}
