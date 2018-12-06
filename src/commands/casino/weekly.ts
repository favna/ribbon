/**
 * @file Casino WeeklyCommand - Receive your weekly 3500 chips top up
 *
 * **Aliases**: `weeklytopup`, `weeklybonus`
 * @module
 * @category casino
 * @name weekly
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class WeeklyCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'weekly',
            aliases: ['weeklytopup', 'weeklybonus'],
            group: 'casino',
            memberName: 'weekly',
            description: 'Receive your weekly cash top up of 3500 chips',
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public run (msg: CommandoMessage) {
        const balEmbed = new MessageEmbed();
        const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));

        let returnMsg = '';

        balEmbed
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
            .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
            .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

        try {
            startTyping(msg);
            const query = conn
                .prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`)
                .get(msg.author.id);

            if (query) {
                const topupdate = moment(query.lasttopup).add(7, 'days');
                const dura = moment.duration(topupdate.diff(moment()));

                let chipStr = '';
                let resetStr = '';

                if (dura.asHours() <= 0) {
                    conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance, lasttopup=$date WHERE userID="${msg.author.id}";`)
                        .run({ balance: query.balance + 3500, date: moment().format('YYYY-MM-DD HH:mm') });

                    chipStr = `${query.balance} ➡ ${query.balance + 3500}`;
                    resetStr = 'in 7 days';
                    returnMsg = 'Topped up your balance with your weekly 3500 chips!';
                } else {
                    chipStr = query.balance;
                    resetStr = dura.format('[in] d[ day and] HH[ hour]');
                    returnMsg = 'Sorry but you are not due to get your weekly chips yet, here is your current balance';
                }

                balEmbed.setDescription(stripIndents`
                    **Balance**
                    ${chipStr}
                    **Weekly Reset**
                    ${resetStr}
                `);

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(balEmbed, returnMsg);
            }
            stopTyping(msg);
            conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($userid, $balance, $date);`)
                .run({ balance: '3500', date: moment().format('YYYY-MM-DD HH:mm'), userid: msg.author.id });
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER, lasttopup TEXT);`)
                    .run();

                conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($userid, $balance, $date);`)
                    .run({ balance: '3500', date: moment().format('YYYY-MM-DD HH:mm'), userid: msg.author.id });
            } else {
                const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

                channel.send(stripIndents`
                    <@${this.client.owners[0].id}> Error occurred in \`weekly\` command!
                    **Server:** ${msg.guild.name} (${msg.guild.id})
                    **Author:** ${msg.author.tag} (${msg.author.id})
                    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                    **Error Message:** ${err}
                `);

                return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
            }
        }

        balEmbed.setDescription(stripIndents`
            **Balance**
            3500
            **Weekly Reset**
            in 7 days
        `);

        deleteCommandMessages(msg, this.client);

        return msg.embed(balEmbed, 'You didn\'t have any chips yet so here\'s your first 3500. Spend them wisely!');
    }
}
