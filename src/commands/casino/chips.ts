/**
 * @file Casino ChipsCommand - Retrieves your current amount of chips for the casino
 *
 * **Aliases**: `bal`, `cash`, `balance`
 * @module
 * @category casino
 * @name chips
 * @example chips
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import 'moment-duration-format';
import path from 'path';
import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class ChipsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'chips',
            aliases: ['bal', 'cash', 'balance'],
            group: 'casino',
            memberName: 'chips',
            description: 'Retrieves your current balance for the casino',
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

        balEmbed
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
            .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

        try {
            startTyping(msg);
            const { balance, lastdaily, lastweekly } = conn.prepare(`SELECT balance, lastdaily, lastweekly FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

            if (balance >= 0) {
                const dailyDura = moment.duration(moment(lastdaily).add(24, 'hours').diff(moment()));
                const weeklyDura = moment.duration(moment(lastweekly).add(7, 'days').diff(moment()));

                balEmbed.setDescription(stripIndents`
                    **Balance**
                    ${balance}
                    **Daily Reset**
                    ${!(dailyDura.asHours() <= 0) ? dailyDura.format('[in] HH[ hour(s) and ]mm[ minute(s)]') : 'Right now!'}
                    **Weekly Reset**
                    ${!(weeklyDura.asDays() <= 0) ? weeklyDura.format('[in] d[ day and] HH[ hour]') : 'Right now!'}
                `);

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(balEmbed);
            }
            conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($userid, $balance, $dailydate, $weeklydate, $vault);`)
                .run({
                    balance: 500,
                    dailydate: moment().format('YYYY-MM-DD HH:mm'),
                    userid: msg.author.id,
                    vault: 0,
                    weeklydate: moment().format('YYYY-MM-DD HH:mm'),
                });
            stopTyping(msg);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table|Cannot destructure property)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER , lastdaily TEXT , lastweekly TEXT , vault INTEGER);`)
                    .run();

                conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($userid, $balance, $dailydate, $weeklydate, $vault);`)
                    .run({
                        balance: 500,
                        dailydate: moment().format('YYYY-MM-DD HH:mm'),
                        userid: msg.author.id,
                        vault: 0,
                        weeklydate: moment().format('YYYY-MM-DD HH:mm'),
                    });
            } else {
                const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

                channel.send(stripIndents`
                    <@${this.client.owners[0].id}> Error occurred in \`chips\` command!
                    **Server:** ${msg.guild.name} (${msg.guild.id})
                    **Author:** ${msg.author.tag} (${msg.author.id})
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
            **Daily Reset**
            in 24 hours
            **Weekly Reset**
            in 7 days
        `);

        deleteCommandMessages(msg, this.client);

        return msg.embed(balEmbed);
    }
}
