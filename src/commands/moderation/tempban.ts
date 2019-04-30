/**
 * @file Moderation TempbanCommand - Temporary bans a member, then unbans them when the timer expires
 *
 * Given amount of minutes, hours or days in the format of `5m`, `2h` or `1d`
 *
 * **Aliases**: `tb`, `rottenbanana`
 * @module
 * @category moderation
 * @name tempban
 * @example tempban Kai
 * @param {GuildMemberResolvable} AnyMember The member to ban from the server
 * @param {string} Time The amount of time this member should be banned
 * @param {string} [TheReason] Reason for this banishment. Include `--no-delete` anywhere in the reason to
 *     prevent Ribbon from deleting the banned member's messages
 */

import { timeparseHelper } from '@components/TimeparseHelper';
import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type TempbanArgs = {
    member: GuildMember;
    time: number;
    reason: string;
    keepMessages: boolean;
};

export default class TempbanCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'tempban',
            aliases: ['tb', 'rottenbanana'],
            group: 'moderation',
            memberName: 'tempban',
            description: 'Temporary bans a member, then unbans them when the timer expires',
            format: 'MemberID|MemberName(partial or full) TimeForTheBan [ReasonForBanning]',
            examples: ['tempban JohnDoe 5m annoying'],
            guildOnly: true,
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
                    key: 'time',
                    prompt: 'How long should that member be banned?',
                    type: 'string',
                    validate: (t: string) => {
                        if (/^(?:[0-9]{1,2}(?:m|h|d){1})$/i.test(t)) return true;
                        return 'Has to be in the pattern of `50m`, `2h` or `01d` wherein `m` would be minutes, `h` would be hours and `d` would be days';
                    },
                    parse: (t: string) => {
                        const match = t.match(/[a-z]+|[^a-z]+/gi);
                        let multiplier = 1;

                        switch (match![1]) {
                            case 'm':
                                multiplier = 1;
                                break;
                            case 'h':
                                multiplier = 60;
                                break;
                            case 'd':
                                multiplier = 1440;
                                break;
                            default:
                                multiplier = 1;
                                break;
                        }

                        return Number(match![0]) * multiplier * 60000;
                    },
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

    @shouldHavePermission('BAN_MEMBERS', true)
    public run (msg: CommandoMessage, { member, time, reason, keepMessages = false }: TempbanArgs) {
        if (member.id === msg.author!.id) return msg.reply('I don\'t think you want to ban yourself.');
        if (!member.bannable) return msg.reply('I cannot ban that member, their role is probably higher than my own!');

        if (/--nodelete/im.test(msg.argString)) {
            keepMessages = true;
            reason =
                reason.substring(0, reason.indexOf('--nodelete')) +
                reason.substring(reason.indexOf('--nodelete') + '--nodelete'.length + 1);
        }

        member.ban({
            days: keepMessages ? 0 : 1,
            reason: reason !== '' ? reason : 'No reason given by staff',
        });

        const banEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const unbanEmbed = new MessageEmbed();

        banEmbed
            .setColor('#FF1900')
            .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
            .setDescription(stripIndents`
                **Member:** ${member.user.tag} (${member.id})
                **Action:** Temporary Ban
                **Duration:** ${timeparseHelper(time, { long: true })}
                **Reason:** ${reason !== '' ? reason : 'No reason given by staff'}`
            )
            .setTimestamp();

        unbanEmbed
            .setColor('#FF1900')
            .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
            .setDescription(stripIndents`
                **Member:** ${member.user.tag} (${member.id})
                **Action:** Temporary ban removed`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, banEmbed);
        }

        setTimeout(() => {
            msg.guild.members.unban(member.user);
            if (msg.guild.settings.get('modlogs', true)) {
                logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, unbanEmbed);
            }

            return msg.embed(unbanEmbed);
        }, time);

        deleteCommandMessages(msg, this.client);

        return msg.embed(banEmbed);
    }
}
