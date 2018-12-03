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

import { oneLine, stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import { deleteCommandMessages, modLogMessage, ms, startTyping, stopTyping } from '../../components';

export default class MuteCommand extends Command {
    private logs: boolean;

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
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
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
                    type: 'string',
                    default: '',
                    validate: (t: string) => {
                        if ((/^(?:[0-9]{1,2}(?:m|h|d){1})$/i).test(t)) {
                            return true;
                        }

                        return 'Has to be in the pattern of `50m`, `2h` or `01d` wherein `m` would be minutes, `h` would be hours and `d` would be days';
                    },
                    parse: (t: string) => {
                        const match = t.match(/[a-z]+|[^a-z]+/gi);
                        let multiplier = 1;

                        switch (match[1]) {
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

                        return Number(match[0]) * multiplier * 60000;
                    },
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member, duration }: { member: GuildMember, duration: number }) {
        if (member.manageable) {
            startTyping(msg);
            try {
                const modlogChannel = msg.guild.settings.get('modlogchannel', null);
                const muteRole = msg.guild.settings.get('muterole',
                    msg.guild.roles.find(r => r.name === 'muted') ? msg.guild.roles.find(r => r.name === 'muted') : null);
                const muteEmbed = new MessageEmbed();

                await member.roles.add(muteRole);

                muteEmbed
                    .setColor('#AAEFE6')
                    .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
                    .setDescription(stripIndents`
                        **Action:** Muted <@${member.id}>
                        **Duration:** ${duration ? ms(duration, { long: true }) : 'Until manually removed'}`)
                    .setTimestamp();

                if (msg.guild.settings.get('modlogs', true)) {
                    modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, muteEmbed);
                    this.logs = true;
                }

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                const muteMessage: Message = (await msg.embed(muteEmbed) as Message);

                if (duration) {
                    setTimeout(async () => {
                        await member.roles.remove(muteRole);
                        muteEmbed.setDescription(stripIndents`**Action:** Mute duration ended, unmuted ${member.displayName} (<@${member.id}>)`);
                        if (this.logs) {
                            const logChannel: TextChannel = (msg.guild.channels.get(modlogChannel) as TextChannel);
                            logChannel.send('', { embed: muteEmbed });
                        }

                        return muteMessage.edit('', { embed: muteEmbed });
                    }, duration);
                }

                return muteMessage;
            } catch (err) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);
                if ((/(?:Missing Permissions)/i).test(err.toString())) {

                    return msg.reply(stripIndents`an error occurred muting \`${member.displayName}\`.
                        Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
                }
                const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

                channel.send(stripIndents`
                    <@${this.client.owners[0].id}> Error occurred in \`addrole\` command!
                    **Server:** ${msg.guild.name} (${msg.guild.id})
                    **Author:** ${msg.author.tag} (${msg.author.id})
                    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                    **Input:** \`${member.user.username} (${member.id})\` ${duration ? ` || \`${ms(duration, { long: true })}` : null}
                    **Error Message:** ${err}
                `);

                return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
            }
        }
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply(stripIndents`an error occurred muting \`${member.displayName}\`.
		    Do I have \`Manage Roles\` permission and am I higher in hierarchy than the target's roles?`);
    }
}