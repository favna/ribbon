/**
 * @file Moderation MuteCommand - Mute a member
 *
 * Requires either a role named `muted` on the server, or first having set the mute role with confmute
 *
 * You can optionally specify a duration for how long this mute will last. Not specifying any will mean it will last
 * until manually unmuted.
 *
 * The format for duration is in minutes, hours or days in the format of `5m`, `2h` or `1d`
 *
 * **Aliases**: `silent`
 * @module
 * @category moderation
 * @name mute
 * @example mute Muffin
 * @param {GuildMemberResolvable} AnyMember Member to mute
 */

import { DURA_FORMAT } from '@components/Constants';
import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, Message, MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

type MuteArgs = {
    member: GuildMember;
    duration: number;
    logs: boolean
};

export default class MuteCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'mute',
            aliases: ['silent'],
            group: 'moderation',
            memberName: 'mute',
            description: 'Mute a member',
            format: 'MemberID|MemberName(partial or full) [DurationForMute]',
            details: stripIndents`Requires either a role named \`muted\` on the server, or first having set the mute role with confmute
                You can optionally specify a duration for how long this mute will last. Not specifying any will mean it will last until manually unmuted.
                The format for duration is in minutes, hours or days in the format of \`5m\`, \`2h\` or \`1d\``,
            examples: ['mute Muffin 2h'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Which member should I mute?',
                    type: 'member',
                },
                {
                    key: 'duration',
                    prompt: 'For how long should they be muted?',
                    type: 'duration',
                    default: 0,
                }
            ],
        });
    }

    @shouldHavePermission('MANAGE_ROLES', true)
    public async run (msg: CommandoMessage, { member, duration, logs }: MuteArgs) {
        if (member.manageable) {
            try {
                const modlogChannel = msg.guild.settings.get('modlogchannel', null);
                const muteRole = msg.guild.settings.get(
                    'muterole',
                    msg.guild.roles.find(r => r.name === 'muted') ? msg.guild.roles.find(r => r.name === 'muted') : null);
                const muteEmbed = new MessageEmbed();

                await member.roles.add(muteRole);

                muteEmbed
                    .setColor('#AAEFE6')
                    .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
                    .setDescription(stripIndents`
                        **Action:** Muted <@${member.id}>
                        **Duration:** ${duration ? moment.duration(duration).format(DURA_FORMAT.slice(5)) : 'Until manually removed'}`
                    )
                    .setTimestamp();

                if (msg.guild.settings.get('modlogs', true)) {
                    logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, muteEmbed);
                    logs = true;
                }

                deleteCommandMessages(msg, this.client);

                const muteMessage: Message = await msg.embed(muteEmbed) as Message;

                if (duration) {
                    setTimeout(async () => {
                        await member.roles.remove(muteRole);
                        muteEmbed.setDescription(stripIndents`
                            **Action:** Mute duration ended, unmuted ${member.displayName} (<@${member.id}>)`
                        );
                        if (logs) {
                            const logChannel: TextChannel = msg.guild.channels.get(modlogChannel) as TextChannel;
                            logChannel.send('', { embed: muteEmbed });
                        }

                        return muteMessage.edit('', muteEmbed);
                    }, duration);
                }

                return muteMessage;
            } catch (err) {
                deleteCommandMessages(msg, this.client);
                if (/(?:Missing Permissions)/i.test(err.toString())) {
                    return msg.reply(stripIndents`an error occurred muting \`${member.displayName}\`.
                        Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
                }
                const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

                channel.send(stripIndents`
                    <@${this.client.owners[0].id}> Error occurred in \`mute\` command!
                    **Server:** ${msg.guild.name} (${msg.guild.id})
                    **Author:** ${msg.author!.tag} (${msg.author!.id})
                    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                    **Member:** \`${member.user.username} (${member.id})\`
                    **Duration:** ${duration ? moment.duration(duration).format(DURA_FORMAT.slice(5)) : null}
                    **Error Message:** ${err}
                `);

                return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
            }
        }
        deleteCommandMessages(msg, this.client);

        return msg.reply(stripIndents`an error occurred muting \`${member.displayName}\`.
                Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
    }
}
