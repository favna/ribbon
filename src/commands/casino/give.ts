/**
 * @file Casino GiveCommand - Give another player some chips
 *
 * **Aliases**: `donate`
 * @module
 * @category casino
 * @name give
 * @example give Favna 10
 * @param {GuildMemberResolvable} AnyMember The member you want to give some chips
 * @param {Number} ChipsAmount The amount of chips you want to give
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import {
    deleteCommandMessages,
    roundNumber,
    startTyping,
    stopTyping,
} from '../../components';

export default class GiveCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'give',
            aliases: ['donate'],
            group: 'casino',
            memberName: 'give',
            description: 'Give another player some chips',
            format: 'AnyMember ChipsAmount',
            examples: ['give GuyInShroomSuit 50'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'player',
                    prompt: 'Which player should I give them to?',
                    type: 'member',
                },
                {
                    key: 'chips',
                    prompt: 'How many chips do you want to give?',
                    type: 'integer',
                    validate: (chips: string) =>
                        Number(chips) >= 1 && Number(chips) <= 1000000
                            ? true
                            : 'Reply with a chips amount between 1 and 10000. Example: `10`',
                    parse: (chips: string) => roundNumber(Number(chips)),
                },
            ],
        });
    }

    public run(
        msg: CommandoMessage,
        { player, chips }: { player: GuildMember; chips: number }
    ) {
        const conn = new Database(
            path.join(__dirname, '../../data/databases/casino.sqlite3')
        );
        const giveEmbed = new MessageEmbed();

        giveEmbed
            .setTitle('Transaction Log')
            .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
            .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

        try {
            startTyping(msg);
            const query = conn
                .prepare(
                    `SELECT * FROM "${
                        msg.guild.id
                    }" WHERE userID = $authorid OR userID = $playerid;`
                )
                .all({
                    authorid: msg.author.id,
                    playerid: player.id,
                });

            if (query.length !== 2) {
                return msg.reply(
                    `looks like either you or the person you want to donate to has no balance yet. Use \`${
                        msg.guild.commandPrefix
                    }chips\` to get some`
                );
            }

            let giverEntry = 0;
            let receiverEntry = 0;

            for (const row in query) {
                if (query[row].userID === msg.author.id) {
                    giverEntry = Number(row);
                }
                if (query[row].userID === player.id) {
                    receiverEntry = Number(row);
                }
            }

            const oldGiverBalance = query[giverEntry].balance;
            const oldReceiverEntry = query[receiverEntry].balance;

            query[giverEntry].balance -= chips;
            query[receiverEntry].balance += chips;

            conn.prepare(
                `UPDATE "${msg.guild.id}" SET balance=? WHERE userID=?;`
            ).run(query[giverEntry].balance, query[giverEntry].userID);
            conn.prepare(
                `UPDATE "${msg.guild.id}" SET balance=? WHERE userID=?;`
            ).run(query[receiverEntry].balance, query[receiverEntry].userID);

            giveEmbed
                .addField(
                    msg.member.displayName,
                    `${oldGiverBalance} ➡ ${query[giverEntry].balance}`
                )
                .addField(
                    player.displayName,
                    `${oldReceiverEntry} ➡ ${query[receiverEntry].balance}`
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(giveEmbed);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                conn.prepare(
                    `CREATE TABLE IF NOT EXISTS "${
                        msg.guild.id
                    }" (userID TEXT PRIMARY KEY, balance INTEGER, lasttopup TEXT);`
                ).run();

                return msg.reply(
                    `looks like you don\'t have any chips yet, please use the \`${
                        msg.guild.commandPrefix
                    }chips\` command to get your first 500`
                );
            }
            const channel = this.client.channels.get(
                process.env.ISSUE_LOG_CHANNEL_ID
            ) as TextChannel;

            channel.send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`give\` command!
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
