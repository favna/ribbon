/**
 * @file Casino WeeklyCommand - Receive your weekly 3500 chips top up
 *
 * **Aliases**: `weeklytopup`, `weeklybonus`
 * @module
 * @category casino
 * @name weekly
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import path from 'path';

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
            .setAuthor(msg.member!.displayName, msg.author!.displayAvatarURL({ format: 'png' }))
            .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

        try {
            startTyping(msg);
            let { balance, lastweekly } = conn.prepare(`SELECT balance, lastweekly FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author!.id);

            if (balance >= 0) {
                const weeklyDura = moment.duration(moment(lastweekly).add(7, 'days').diff(moment()));
                const prevBal = balance;

                let chipStr = '';
                let resetStr = '';

                balance += 2000;

                if (weeklyDura.asDays() <= 0) {
                    conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance, lastweekly=$date WHERE userID="${msg.author!.id}";`)
                        .run({ balance, date: moment().format('YYYY-MM-DD HH:mm') });

                    chipStr = `${prevBal} ➡ ${balance}`;
                    resetStr = 'in 7 days';
                    returnMsg = 'Topped up your balance with your weekly bonus of 2000 chips!';
                } else {
                    chipStr = prevBal;
                    resetStr = weeklyDura.format('[in] d[ day and] HH[ hour]');
                    returnMsg = 'Sorry but you are not due to get your weekly bonus chips yet, here is your current balance';
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
            conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($userid, $balance, $dailydate, $weeklydate, $vault);`)
                .run({
                    balance: 2000,
                    dailydate: moment().format('YYYY-MM-DD HH:mm'),
                    userid: msg.author!.id,
                    vault: 0,
                    weeklydate: moment().format('YYYY-MM-DD HH:mm'),
                });
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table|Cannot destructure property)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER , lastdaily TEXT , lastweekly TEXT , vault INTEGER);`)
                    .run();

                conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($userid, $balance, $dailydate, $weeklydate, $vault);`)
                    .run({
                        balance: 500,
                        dailydate: moment().format('YYYY-MM-DD HH:mm'),
                        userid: msg.author!.id,
                        vault: 0,
                        weeklydate: moment().format('YYYY-MM-DD HH:mm'),
                    });
            } else {
                const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

                channel.send(stripIndents`
                    <@${this.client.owners[0].id}> Error occurred in \`weekly\` command!
                    **Server:** ${msg.guild.name} (${msg.guild.id})
                    **Author:** ${msg.author!.tag} (${msg.author!.id})
                    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                    **Error Message:** ${err}
                `);

                return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
            }
        }

        balEmbed.setDescription(stripIndents`
            **Balance**
            500
            **Weekly Reset**
            in 7 days
        `);

        deleteCommandMessages(msg, this.client);

        return msg.embed(balEmbed, 'You didn\'t have any chips yet so here\'s your first 500. Spend them wisely!');
    }
}
