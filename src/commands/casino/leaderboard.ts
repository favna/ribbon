/**
 * @file Casino LeaderboardCommand - Shows the top 5 ranking players for your server
 *
 * **Aliases**: `lb`, `casinolb`, `leaderboards`
 * @module
 * @category casino
 * @name leaderboard
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, ICasinoRow, roundNumber, startTyping, stopTyping } from '../../components';

export default class LeaderboardCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'leaderboard',
            aliases: ['lb', 'casinolb', 'leaderboards'],
            group: 'casino',
            memberName: 'leaderboard',
            description: 'Shows the top 5 ranking players for your server',
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'limit',
                    prompt: 'How many players should I show?',
                    type: 'integer',
                    max: 20,
                    min: 1,
                    default: 5,
                    parse: (limit: string) => roundNumber(Number(limit)),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { limit }: { limit: number }) {
        const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));
        const lbEmbed = new MessageEmbed();

        lbEmbed
            .setTitle(`Top ${limit} players`)
            .setColor(msg.guild ? msg.guild.me.displayHexColor : process.env.DEFAULT_EMBED_COLOR)
            .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

        try {
            startTyping(msg);
            const query = conn
                .prepare(`SELECT userID, balance FROM "${msg.guild.id}" ORDER BY balance DESC LIMIT ?;`)
                .all(limit);

            if (query) {
                query.forEach((player: ICasinoRow, index: number) => {
                    lbEmbed.addField(
                        `#${index + 1} ${msg.guild.members.get(player.userID).displayName}`,
                        `Chips: ${player.balance}`
                    );
                });

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(lbEmbed);
            }
            stopTyping(msg);

            return msg.reply(`looks like there aren't any casino players in this server yet, use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table|Cannot destructure property)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER , lastdaily TEXT , lastweekly TEXT , vault INTEGER);`)
                    .run();

                return msg.reply(`looks like there aren't any casino players in this server yet, use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`leaderboard\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
        }
    }
}
