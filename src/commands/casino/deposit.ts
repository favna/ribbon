/**
 * @file Casino DepositCommand - Deposit chips into your vault
 *
 * **Aliases**: `depo`
 * @module
 * @category casino
 * @name deposit
 * @example deposit 100
 * @param {number} ChipsAmount The amount of chips to deposit
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import path from 'path';
import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR, deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components';

export default class DepositCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'deposit',
            aliases: ['depo'],
            group: 'casino',
            memberName: 'deposit',
            description: 'Deposit chips into your vault',
            format: 'ChipsAmount',
            examples: ['deposit 100'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'chips',
                    prompt: 'How many chips do you want to deposit?',
                    type: 'integer',
                    parse: (chips: string) => roundNumber(Number(chips)),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { chips }: { chips: number }) {
        const depositEmbed = new MessageEmbed();
        const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));

        depositEmbed
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
            .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/bank.png`);

        try {
            startTyping(msg);
            let { balance, vault } = conn.prepare(`SELECT balance, vault FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

            if (balance >= 0) {
                if (chips > balance) {
                    return msg.reply(oneLine`you don\'t have enough chips to make that deposit.
                    Use \`${msg.guild.commandPrefix}chips\` to check your current balance.
                    or withdraw some chips from your vault with \`${msg.guild.commandPrefix}withdraw\``);
                }

                const prevBal = balance;
                const prevVault = vault;

                balance -= chips;
                vault += chips;

                conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance, vault=$vault WHERE userID="${msg.author.id}"`)
                    .run({ balance, vault });

                depositEmbed
                    .setTitle('Vault deposit completed successfully')
                    .addField('Previous balance', prevBal, true)
                    .addField('New balance', balance, true)
                    .addField('Previous vault content', prevVault, true)
                    .addField('New vault content', vault, true);

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(depositEmbed);
            }

            stopTyping(msg);

            return msg.reply(oneLine`looks like you either don't have any chips yet or you used them all
                Run \`${msg.guild.commandPrefix}chips\` to get your first 500
                or run \`${msg.guild.commandPrefix}withdraw\` to withdraw some chips from your vault.`);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table|Cannot destructure property)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER , lastdaily TEXT , lastweekly TEXT , vault INTEGER);`)
                    .run();

                return msg.reply(`looks like you don't have any chips yet, please use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
            }

            const channel = this.client.channels.get((process.env.ISSUE_LOG_CHANNEL_ID as string)) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`withdraw\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
