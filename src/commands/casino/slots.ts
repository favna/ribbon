/**
 * @file Casino SlotsCommand - Gamble your chips at the slot machine
 *
 * **Aliases**: `slot`, `fruits`
 * @module
 * @category casino
 * @name slots
 * @example slots 5
 * @param {number} ChipsAmount The amount of chips you want to gamble
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { SlotMachine, SlotSymbol } from 'slot-machine';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components';

export default class SlotsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'slots',
            aliases: ['slot', 'fruits'],
            group: 'casino',
            memberName: 'slots',
            description: 'Gamble your chips at the slot machine',
            format: 'AmountOfChips',
            examples: ['slots 50'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'chips',
                    prompt: 'How many chips do you want to gamble?',
                    type: 'integer',
                    oneOf: [1, 2, 3],
                    parse: (p: string) => roundNumber(Number(p)),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { chips }: { chips: number }) {
        const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));
        const slotEmbed = new MessageEmbed();

        slotEmbed
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
            .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
            .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

        try {
            startTyping(msg);
            let { balance } = conn.prepare(`SELECT balance, userID FROM "${msg.guild.id}" WHERE userID = ?;`).get(msg.author.id);

            if (balance >= 0) {
                if (chips > balance) {
                    return msg.reply(`you don\'t have enough chips to make that bet. Use \`${msg.guild.commandPrefix}chips\` to check your current balance.`);
                }

                const bar = new SlotSymbol('bar', {
                    display: '<:bar:512360724153106442>',
                    points: 50,
                    weight: 20,
                });
                const cherry = new SlotSymbol('cherry', {
                    display: '<:cherry:512360724472004630>',
                    points: 6,
                    weight: 100,
                });
                const diamond = new SlotSymbol('diamond', {
                    display: '<:diamond:512360724660617244>',
                    points: 15,
                    weight: 40,
                });
                const lemon = new SlotSymbol('lemon', {
                    display: '<:lemon:512360724589182976>',
                    points: 8,
                    weight: 80,
                });
                const seven = new SlotSymbol('seven', {
                    display: '<:seven:512360724698365992>',
                    points: 300,
                    weight: 10,
                });
                const watermelon = new SlotSymbol('watermelon', {
                    display: '<:watermelon:512360724656554027>',
                    points: 10,
                    weight: 60,
                });

                const machine = new SlotMachine(3, [bar, cherry, diamond, lemon, seven, watermelon]);
                const prevBal = balance;
                const result = machine.play();

                let titleString: string;
                let winningPoints = 0;

                switch (chips) {
                    case 1:
                        winningPoints += result.lines[1].points;
                        break;
                    case 2:
                        for (let i = 0; i <= 2; ++i) {
                            if (result.lines[i].isWon) {
                                winningPoints += result.lines[i].points;
                            }
                        }
                        break;
                    case 3:
                        for (const line of result.lines) {
                            if (line.isWon) {
                                winningPoints += line.points;
                            }
                        }
                        break;
                    default:
                        break;
                }

                winningPoints !== 0
                    ? (balance += winningPoints - chips)
                    : (balance -= chips);

                conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${msg.author.id}";`)
                    .run({ balance });

                titleString =
                    chips === winningPoints
                        ? 'won back their exact input'
                        : chips > winningPoints
                        ? `lost ${chips - winningPoints} chips ${
                            winningPoints !== 0
                                ? `(slots gave back ${winningPoints})`
                                : ''
                            }`
                        : `won ${balance - prevBal} chips`;

                slotEmbed
                    .setTitle(`${msg.author.tag} ${titleString}`)
                    .addField('Previous Balance', prevBal, true)
                    .addField('New Balance', balance, true)
                    .setDescription(result.visualize());

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(slotEmbed);
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

                return msg.reply(`looks like you don\'t have any chips yet, please use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`slots\` command!
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
