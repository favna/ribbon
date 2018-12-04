/**
 * @file Moderation ListWarnCommand - Show the amount of warning points a member has
 *
 * **Aliases**: `reqwarn`, `lw`, `rw`
 * @module
 * @category moderation
 * @name listwarn
 * @example listwarn Biscuit
 * @param {GuildMemberResolvable} AnyMember The member of whom to list the warning points
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import {
    deleteCommandMessages,
    startTyping,
    stopTyping,
} from '../../components';

export default class ListWarnCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'listwarn',
            aliases: ['reqwarn', 'lw', 'rw'],
            group: 'moderation',
            memberName: 'listwarn',
            description: 'Lists the warning points given to a member',
            format: 'MemberID|MemberName(partial or full)',
            examples: ['listwarn Biscuit'],
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Which member should I show warning points for?',
                    type: 'member',
                },
            ],
        });
    }

    public run(msg: CommandoMessage, { member }: { member: GuildMember }) {
        const conn = new Database(
            path.join(__dirname, '../../data/databases/warnings.sqlite3')
        );
        const embed = new MessageEmbed();

        embed
            .setColor('#ECECC9')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setTimestamp();

        try {
            startTyping(msg);
            const query = conn
                .prepare(`SELECT * FROM "${msg.guild.id}" WHERE id= ?;`)
                .get(member.id);

            embed.setDescription(stripIndents`**Member:** ${query.tag} (${
                query.id
            })
                      **Current warning Points:** ${query.points}`);
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(embed);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                return msg.reply(
                    `no warnpoints found for this server, it will be created the first time you use the \`${
                        msg.guild.commandPrefix
                    }warn\` command`
                );
            }
            if (
                /(?:TypeError: Cannot read property 'tag')/i.test(
                    err.toString()
                )
            ) {
                embed.setDescription(stripIndents`**Member:** ${
                    member.user.tag
                } (${member.id})
                    **Current warning Points:** 0`);

                return msg.embed(embed);
            }
            const channel = this.client.channels.get(
                process.env.ISSUE_LOG_CHANNEL_ID
            ) as TextChannel;

            channel.send(stripIndents`
                <@${
                    this.client.owners[0].id
                }> Error occurred in \`listwarn\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format(
                    'MMMM Do YYYY [at] HH:mm:ss [UTC]Z'
                )}
                **Input:** \`${member.user.tag} (${member.id})\`
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
