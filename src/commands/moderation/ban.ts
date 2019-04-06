/**
 * @file Moderation BanCommand - Ban a bad member
 *
 * **Aliases**: `b`, `banana`
 * @module
 * @category moderation
 * @name ban
 * @example ban MultiMegaMander
 * @param {GuildMemberResolvable} AnyMember The member to ban from the server
 * @param {string} [TheReason] Reason for this banishment. Include `--no-delete` anywhere in the reason to
 *     prevent Ribbon from deleting the banned member's messages
 */

import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

export default class BanCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'ban',
            aliases: ['b', 'banana'],
            group: 'moderation',
            memberName: 'ban',
            description: 'Bans a member from the server',
            format: 'MemberID|MemberName(partial or full) [ReasonForBanning]',
            examples: ['ban JohnDoe annoying'],
            guildOnly: true,
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Which member should I ban?',
                    type: 'member',
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason for this banishment?',
                    type: 'string',
                    default: '',
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { member, reason, keepmessages }: { member: GuildMember; reason: string; keepmessages: boolean }) {
        if (member.id === msg.author.id) return msg.reply('I don\'t think you want to ban yourself.');
        if (!member.bannable) return msg.reply('I cannot ban that member, their role is probably higher than my own!');
        startTyping(msg);

        if (/--nodelete/im.test(msg.argString)) {
            keepmessages = true;
            reason =
                reason.substring(0, reason.indexOf('--nodelete')) +
                reason.substring(reason.indexOf('--nodelete') + '--nodelete'.length + 1);
        }

        member.ban({
            days: keepmessages ? 0 : 1,
            reason: reason !== '' ? reason : 'No reason given by staff',
        });

        const banEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        banEmbed
            .setColor('#FF1900')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                **Member:** ${member.user.tag} (${member.id})
                **Action:** Ban
                **Reason:** ${reason !== '' ? reason : 'No reason given by staff'}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, banEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(banEmbed);
    }
}
