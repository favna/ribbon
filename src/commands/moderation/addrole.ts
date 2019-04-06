/**
 * @file Moderation AddRoleCommand - Add a role to a member
 *
 * **Aliases**: `newrole`, `ar`
 * @module
 * @category moderation
 * @name addrole
 * @example addrole Favna Member
 * @param {GuildMemberResolvable} AnyMember Member to give a role
 * @param {RoleResolvable} AnyRole Role to give
 */

import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed, Role, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';

export default class AddRoleCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'addrole',
            aliases: ['newrole', 'ar'],
            group: 'moderation',
            memberName: 'addrole',
            description: 'Adds a role to a member',
            format: 'MemberID|MemberName(partial or full) RoleID|RoleName(partial or full)',
            examples: ['addrole favna tagrole1'],
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
                    prompt: 'Which member should I assign a role to?',
                    type: 'member',
                },
                {
                    key: 'role',
                    prompt: 'What role should I add to that member?',
                    type: 'role',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { member, role }: { member: GuildMember; role: Role }) {
        try {
            if (!member.manageable) {
                return msg.reply(oneLine`looks like I do not have permission to edit the roles of ${member.displayName}.
                    Better go and fix your server's role permissions if you want to use this command!`);
            }

            startTyping(msg);

            const modlogChannel = msg.guild.settings.get('modlogchannel', null);
            const roleAddEmbed = new MessageEmbed();

            await member.roles.add(role);

            roleAddEmbed
                .setColor('#AAEFE6')
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
                .setDescription(stripIndents`**Action:** Added ${role.name} to ${member.displayName}`)
                .setTimestamp();

            if (msg.guild.settings.get('modlogs', true)) {
                modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, roleAddEmbed);
            }

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(roleAddEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);
            if (/(?:Missing Permissions)/i.test(err.toString())) {
                return msg.reply(stripIndents`an error occurred adding the role \`${role.name}\` to \`${member.displayName}\`.
                    The server staff should check that I have \`Manage Roles\` permission and I have the proper hierarchy.`);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`addrole\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** \`${role.name} (${role.id})\` || \`${member.user.tag} (${member.id})\`
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
