/**
 * @file Moderation NickCommand - Nickname a single member
 *
 * **Aliases**: `nick`
 * @module
 * @category moderation
 * @name nickname
 * @example nick Muffin Cupcake
 * @param {GuildMemberResolvable} AnyMember Member to give a nickname
 * @param {string} NewNickname Nickname to assign
 */

import { deleteCommandMessages, logModMessage, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

export default class NickCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'nickname',
            aliases: ['nick'],
            group: 'moderation',
            memberName: 'nickname',
            description: 'Assigns a nickname to a member',
            format: 'MemberID|MemberName(partial or full) NewNickname|clear',
            details: 'Use `clear` to remove the nickname',
            examples: ['nick favna pyrrha nikos'],
            guildOnly: true,
            clientPermissions: ['MANAGE_NICKNAMES'],
            userPermissions: ['MANAGE_NICKNAMES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Which member should I assign a nickname to?',
                    type: 'member',
                },
                {
                    key: 'nickname',
                    prompt: 'What nickname should I assign?',
                    type: 'string',
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { member, nickname }: { member: GuildMember; nickname: string }) {
        startTyping(msg);
        if (member.manageable) {
            const modlogChannel = msg.guild.settings.get('modlogchannel', null);
            const nicknameEmbed = new MessageEmbed();
            const oldName = member.displayName;

            try {
                if (nickname === 'clear') {
                    member.setNickname('');
                } else {
                    member.setNickname(nickname);
                }

                nicknameEmbed
                    .setColor('#3DFFE5')
                    .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
                    .setDescription(stripIndents`
                        **Action:** Nickname change
                        **Member:** <@${member.id}> (${member.user.tag})
                        **Old name:** ${oldName}
                        **New name:** ${nickname}
                    `)
                    .setTimestamp();

                if (msg.guild.settings.get('modlogs', true)) {
                    logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, nicknameEmbed);
                }

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(nicknameEmbed);
            } catch (err) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);
                const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

                channel.send(stripIndents`
                    <@${this.client.owners[0].id}> Error occurred in \`nickname\` command!
                    **Server:** ${msg.guild.name} (${msg.guild.id})
                    **Author:** ${msg.author.tag} (${msg.author.id})
                    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                    **Input:** \`${member.user.tag} (${member.id})\` || \`${nickname}\`
                    **Error Message:** ${err}
                `);

                return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
            }
        }
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply(oneLine`failed to set nickname to that member.
            Check that I have permission to set their nickname as well as the role hierarchy`);
    }
}
