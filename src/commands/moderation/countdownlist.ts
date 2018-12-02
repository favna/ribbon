/**
 * @file Moderation CountDownList - List all stored countdown messages in the current guild
 *
 * **Aliases**: `cl`, `cdlist`
 * @module
 * @category moderation
 * @name countdownlist
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { TextChannel, Util } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import 'moment-duration-format';
import * as path from 'path';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class CountDownList extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'countdownlist',
            aliases: ['cd', 'cdlist'],
            group: 'moderation',
            memberName: 'countdownlist',
            description: 'List all stored countdown messages in the current guild',
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public async run (msg: CommandoMessage) {
        startTyping(msg);
        const conn = new Database(path.join(__dirname, '../../data/databases/countdowns.sqlite3'));

        try {
            startTyping(msg);
            const rows = conn.prepare(`SELECT * FROM "${msg.guild.id}"`).all();
            let body = '';

            for (const row in rows) {
                body += `${stripIndents`
                    **id:** ${rows[row].id}
                    **Event at:** ${moment(rows[row].datetime).format('YYYY-MM-DD HH:mm')}
                    **Countdown Duration:** ${moment.duration(moment(rows[row].datetime).diff(moment(), 'days'), 'days')
                                .format('w [weeks][, ] d [days] [and] h [hours]')}
                    **Tag on event:** ${rows[row].tag === 'none' ? 'No one' : `@${rows[row].tag}`}
                    **Channel:** <#${rows[row].channel}> (\`${rows[row].channel}\`)
                    **Content:** ${rows[row].content}
                    **Last sent at:** ${moment(rows[row].lastsend).format('YYYY-MM-DD HH:mm [UTC]Z')}`}\n\n`;
            }

            deleteCommandMessages(msg, this.client);

            if (body.length >= 1800) {
                const splitContent: any = Util.splitMessage(body, { maxLength: 1800 });

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
                title: 'Countdowns stored on this server',
            });
        } catch (err) {
            stopTyping(msg);
            if ((/(?:no such table)/i).test(err.toString())) {
                return msg.reply(`no countdowns found for this server. Start saving your first with ${msg.guild.commandPrefix}countdownadd`);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`countdownlist\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}