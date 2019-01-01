/**
 * @file Casino BankCommand - View your vault content
 *
 * **Aliases**: `vault`
 * @module
 * @category casino
 * @name bank
 * @example bank
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class BankCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'bank',
            aliases: ['vault'],
            group: 'casino',
            memberName: 'bank',
            description: 'View your vault content',
            examples: ['bank', 'vault'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public run (msg: CommandoMessage) {
        const bankEmbed = new MessageEmbed();
        const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));

        bankEmbed
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
            .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/bank.png`);

        try {
            startTyping(msg);
            const { balance, vault, lastdaily, lastweekly } = conn.prepare(`SELECT balance, vault, lastdaily, lastweekly FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

            if (balance >= 0) {
                const dailyDura = moment.duration(moment(lastdaily).add(24, 'hours').diff(moment()));
                const weeklyDura = moment.duration(moment(lastweekly).add(7, 'days').diff(moment()));

                bankEmbed
                    .setTitle(`${msg.author.tag}'s vault content`)
                    .setDescription(stripIndents`
                        **Vault Content**
                        ${vault}
                        **Balance**
                        ${balance}
                        **Daily Reset**
                        ${!(dailyDura.asMilliseconds() <= 0) ? dailyDura.format('[in] HH[ hour(s) and ]mm[ minute(s)]') : 'Right now!'}
                        **Weekly Reset**
                        ${!(weeklyDura.asDays() <= 0) ? weeklyDura.format('[in] d[ day and] HH[ hour]') : 'Right now!'}
                    `);

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(bankEmbed);
            }
            stopTyping(msg);

            return msg.reply(`looks like you didn't get any chips yet. Run \`${msg.guild.commandPrefix}chips\` to get your first 500`);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table|Cannot destructure property)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER , lastdaily TEXT , lastweekly TEXT , vault INTEGER);`)
                    .run();

                return msg.reply(`looks like you don't have any chips yet, please use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`bank\` command!
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
