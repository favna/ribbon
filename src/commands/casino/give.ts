/**
 * @file Casino GiveCommand - Give another player some chips
 *
 * **Aliases**: `donate`
 * @module
 * @category casino
 * @name give
 * @example give Favna 10
 * @param {GuildMemberResolvable} AnyMember The member you want to give some chips
 * @param {number} ChipsAmount The amount of chips you want to give
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { CasinoRowType } from '@components/Types';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import path from 'path';

type GiveArgs = {
    player: GuildMember;
    chips: number;
};

export default class GiveCommand extends Command {
    constructor (client: CommandoClient) {
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
                    type: 'casino',
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { player, chips }: GiveArgs) {
        const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));
        const giveEmbed = new MessageEmbed();

        giveEmbed
            .setTitle('Transaction Log')
            .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

        try {
            const query = conn
                .prepare(`SELECT userID, balance FROM "${msg.guild.id}" WHERE userID = $authorid OR userID = $playerid;`)
                .all({ authorid: msg.author!.id, playerid: player.id });

            if (query.length !== 2) throw new Error('no_balance');

            query.forEach((row: CasinoRowType) => {
                if (row.userID === msg.author!.id && chips > row.balance) {
                    throw new Error('insufficient_balance');
                }
            });

            let giverEntry = 0;
            let receiverEntry = 0;

            query.forEach((row: CasinoRowType, index: number) => {
                if (row.userID === msg.author!.id) giverEntry = Number(index);
                if (row.userID === player.id) receiverEntry = Number(index);
            });

            const oldGiverBalance = query[giverEntry].balance;
            const oldReceiverEntry = query[receiverEntry].balance;

            query[giverEntry].balance -= chips;
            query[receiverEntry].balance += chips;

            conn.prepare(`UPDATE "${msg.guild.id}" SET balance=? WHERE userID=?;`)
                .run(query[giverEntry].balance, query[giverEntry].userID);
            conn.prepare(`UPDATE "${msg.guild.id}" SET balance=? WHERE userID=?;`)
                .run(query[receiverEntry].balance, query[receiverEntry].userID);

            giveEmbed
                .addField(msg.member!.displayName, `${oldGiverBalance} ➡ ${query[giverEntry].balance}`)
                .addField(player.displayName, `${oldReceiverEntry} ➡ ${query[receiverEntry].balance}`);

            deleteCommandMessages(msg, this.client);

            return msg.embed(giveEmbed);
        } catch (err) {
            if (/(?:no such table|Cannot destructure property)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER , lastdaily TEXT , lastweekly TEXT , vault INTEGER);`)
                    .run();

                return msg.reply(`looks like you don't have any chips yet, please use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
            }

            if (/(?:no_balance)/i.test(err.toString())) {
                return msg.reply(`looks like either you or the person you want to donate to has no balance yet. Use \`${msg.guild.commandPrefix}chips\` to get some`);
            }

            if (/(?:insufficient_balance)/i.test(err.toString())) {
                return msg.reply(`you don't have that many chips to donate. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
            }

            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`give\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author!.tag} (${msg.author!.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
