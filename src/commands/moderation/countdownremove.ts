/**
 * @file Moderation CountDownRemove - Remove a specified countdown
 *
 * Use the countdownlist command to find the ID for deleting
 *
 * **Aliases**: `cdremove`, `countdowndelete`, `cddelete`, `cdd`, `cdr`
 * @module
 * @category moderation
 * @name countdownremove
 * @example countdownremove 1
 * @param {string} CountdownID The ID of the Countdown to remove
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import 'moment-duration-format';
import * as path from 'path';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components';

export default class CountDownRemove extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'countdownremove',
            aliases: ['cdremove', 'countdowndelete', 'cddelete', 'cdd', 'cdr'],
            group: 'moderation',
            memberName: 'countdownremove',
            description: 'Remove a specified countdown',
            format: 'CountdownID',
            details: 'Use the countdownlist command to find the ID for deleting',
            examples: ['countdownremove 1'],
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'id',
                    prompt: 'Which countdowns should I delete?',
                    type: 'integer',
                    validate: (v: string, msg: CommandoMessage) => {
                        const conn = new Database(path.join(__dirname, '../../data/databases/countdowns.sqlite3'));
                        const rows = conn.prepare(`SELECT id FROM "${msg.guild.id}";`).all();

                        if (rows.some(el => el.id === Number(v))) return true;

                        return `that is not an ID of a countdown stored for this guild. You can view all the stored countdowns with the \`${msg.guild.commandPrefix}countdownlist\` command`;
                    },
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { id }: { id: string }) {
        try {
            startTyping(msg);

            const conn = new Database(path.join(__dirname, '../../data/databases/countdowns.sqlite3'));
            const modlogChannel = msg.guild.settings.get('modlogchannel', null);
            const cdrEmbed = new MessageEmbed();
            const { datetime, tag, channel, content } = conn.prepare(`SELECT datetime, tag, channel, content from "${msg.guild.id}" WHERE id = ?`).get(id);

            conn.prepare(`DELETE FROM "${msg.guild.id}" WHERE id = ?`).run(id);

            cdrEmbed
                .setColor('#F7F79D')
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
                .setDescription(stripIndents`
                    **Action:** Countdown removed
                    **Event was at:** ${moment(datetime).format('YYYY-MM-DD HH:mm')}
                    **Countdown Duration:** ${moment.duration(moment(datetime).diff(moment(), 'days'), 'days').format('w [weeks][, ] d [days] [and] h [hours]')}
                    **Tag on event:** ${tag === 'none' ? 'No one' : `@${tag}`}
                    **Channel:** <#${channel}>
                    **Message:** ${content}`
                )
                .setTimestamp();

            if (msg.guild.settings.get('modlogs', true)) {
                modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, cdrEmbed);
            }

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(cdrEmbed);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table|Cannot destructure property)/i.test(err.toString())) {
                return msg.reply(`no countdowns found for this server. Start saving your first with ${msg.guild.commandPrefix}countdownadd`);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
		        <@${this.client.owners[0].id}> Error occurred in validating the ID for the \`countdownremove\` command!
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
