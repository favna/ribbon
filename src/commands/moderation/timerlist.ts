/**
 * @file Moderation TimerListCommand - List all stored timed messages in the current guild
 *
 * **Aliases**: `tl`, `timelist`
 * @module
 * @category moderation
 * @name timerlist
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { Snowflake, TextChannel, Util } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import {
    deleteCommandMessages,
    ms,
    startTyping,
    stopTyping,
} from '../../components';

export default class TimerListCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'timerlist',
            aliases: ['tl', 'timelist'],
            group: 'moderation',
            memberName: 'timerlist',
            description: 'List all stored timed messages in the current guild',
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public async run(msg: CommandoMessage) {
        startTyping(msg);
        const conn = new Database(
            path.join(__dirname, '../../data/databases/timers.sqlite3')
        );

        try {
            startTyping(msg);
            const rows = conn.prepare(`SELECT * FROM "${msg.guild.id}"`).all();
            let body = '';

            for (const row in rows) {
                body += `${stripIndents`
                    **id:** ${rows[row].id}
                    **interval:** ${ms(rows[row].interval, { long: true })}
                    **channel:** <#${rows[row].channel}>
                    **content:** ${rows[row].content}
                    **last sent at:** ${moment(rows[row].lastsend).format(
                        'YYYY-MM-DD HH:mm [UTC]Z'
                    )}`}
                    **members tagged on send:** ${rows[row].members
                        .split(';')
                        .map((member: Snowflake) => `<@${member}>`)
                        .join(' ')}\n\n
                `;
            }

            deleteCommandMessages(msg, this.client);

            if (body.length >= 1800) {
                const splitContent: any = Util.splitMessage(body, {
                    maxLength: 1800,
                });

                for (const part in splitContent) {
                    await msg.embed({
                        color: msg.guild.me.displayColor,
                        description: splitContent[part],
                    });
                }
                stopTyping(msg);

                return null;
            }

            stopTyping(msg);

            return msg.embed({
                color: msg.guild.me.displayColor,
                description: body,
                title: 'Timed messages stored on this server',
            });
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                return msg.reply(
                    `no timed messages found for this server. Start saving your first with ${
                        msg.guild.commandPrefix
                    }timeradd`
                );
            }
            const channel = this.client.channels.get(
                process.env.ISSUE_LOG_CHANNEL_ID
            ) as TextChannel;

            channel.send(stripIndents`
                <@${
                    this.client.owners[0].id
                }> Error occurred in \`timerlist\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format(
                    'MMMM Do YYYY [at] HH:mm:ss [UTC]Z'
                )}
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
