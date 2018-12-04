/**
 * @file Info IamNotCommand - Remove self assigned roles
 *
 * **Aliases**: `notself`, `iamn`
 * @module
 * @category info
 * @name iamnot
 * @example iamnot uploader
 * @param {RoleResolvable} AnyRole The role you want to remove from yourself
 */

import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, Role, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import {
    deleteCommandMessages,
    modLogMessage,
    startTyping,
    stopTyping,
} from '../../components';

export default class IamNotCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'iamnot',
            aliases: ['notself', 'iamn'],
            group: 'info',
            memberName: 'iamnot',
            description: 'Remove self assigned roles',
            examples: ['iamnot uploader'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'role',
                    prompt: 'Which role do you want to remove from yourself?',
                    type: 'role',
                },
            ],
        });
    }

    public async run(
        msg: CommandoMessage,
        { role, roleNames = [] }: { role: Role; roleNames: Array<string> }
    ) {
        try {
            if (!msg.member.manageable) {
                return msg.reply(
                    "looks like I do not have permission to edit your roles. The staff will have to fix the server's role permissions if you want to use this command!"
                );
            }

            startTyping(msg);

            const modlogChannel = msg.guild.settings.get('modlogchannel', null);
            const roleAddEmbed = new MessageEmbed();
            const roles = msg.guild.settings.get('selfroles', []);

            if (!roles.length) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.reply('this server has no self assignable roles');
            }

            roles.forEach((r: string) =>
                roleNames.push(msg.guild.roles.get(r).name)
            );

            if (!roles.includes(role.id)) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.reply(
                    `that role is not self-assignable. The self-assignable roles are ${roleNames
                        .map(val => `\`${val}\``)
                        .join(', ')}`
                );
            }

            await msg.member.roles.remove(role);

            roleAddEmbed
                .setColor('#AAEFE6')
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
                .setDescription(
                    stripIndents`**Action:** \`${msg.member.displayName}\` (\`${
                        msg.author.id
                    }\`) removed \`${
                        role.name
                    }\` from themselves with the \`iamnot\` command`
                )
                .setTimestamp();

            if (msg.guild.settings.get('modlogs', true)) {
                modLogMessage(
                    msg,
                    msg.guild,
                    modlogChannel,
                    msg.guild.channels.get(modlogChannel) as TextChannel,
                    roleAddEmbed
                );
            }

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(roleAddEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            if (/(?:Missing Permissions)/i.test(err.toString())) {
                return msg.reply(stripIndents`an error occurred removing the role \`${
                    role.name
                }\` from you.
              The mods should check that I have \`Manage Roles\` permission and I am higher in hierarchy than the your roles?`);
            } else if (
                /(?:is not an array or collection of roles)/i.test(
                    err.toString()
                )
            ) {
                return msg.reply(
                    stripIndents`it looks like you supplied an invalid role to add. If you are certain that the role is valid please feel free to open an issue on the GitHub.`
                );
            }

            const channel = this.client.channels.get(
                process.env.ISSUE_LOG_CHANNEL_ID
            ) as TextChannel;

            channel.send(stripIndents`
          <@${this.client.owners[0].id}> Error occurred in \`addrole\` command!
          **Server:** ${msg.guild.name} (${msg.guild.id})
          **Author:** ${msg.author.tag} (${msg.author.id})
          **Time:** ${moment(msg.createdTimestamp).format(
              'MMMM Do YYYY [at] HH:mm:ss [UTC]Z'
          )}
          **Input:** \`${role.name} (${role.id})\` || \`${msg.author.tag} (${
                msg.author.id
            })\`
          **Error Message:** ${err}
      `);

            return msg.reply(oneLine`An error occurred but I notified ${
                this.client.owners[0].username
            }
          Want to know more about the error? Join the support server by getting an invite by using the \`${
              msg.guild.commandPrefix
          }invite\` command `);
        }
    }
}
