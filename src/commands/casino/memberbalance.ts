/**
 * @file Casino MemberBalanceCommand - Retrieves the amount of chips another member has for the casino
 *
 * **Aliases**: `mbal`, `mcash`, `mbalance`, `mchips`
 * @module
 * @category casino
 * @name memberbalance
 * @example mchips Rohul
 * @param {GuildMemberResolvable} AnyMember Member to get the balance for
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class MemberBalanceCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'memberbalance',
            aliases: ['mbal', 'mcash', 'mbalance', 'mchips'],
            group: 'casino',
            memberName: 'memberbalance',
            description: 'Retrieves the amount of chips another member has for the casino',
            format: 'MemberID|MemberName(partial or full)',
            examples: ['memberbalance Sagiri'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'player',
                    prompt: 'Whose balance do you want to view?',
                    type: 'member',
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { player }: { player: GuildMember }) {
        const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));
        const mbalEmbed = new MessageEmbed();

        mbalEmbed
            .setAuthor(player.displayName, player.user.displayAvatarURL({ format: 'png' }))
            .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
            .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png');

        try {
            startTyping(msg);
            const query = conn
                .prepare(`SELECT * FROM "${msg.guild.id}" WHERE userID = ?;`)
                .get(player.id);

            if (query) {
                mbalEmbed.setDescription(stripIndents`
                    **Balance**
                    ${query.balance}
                `);

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(mbalEmbed);
            }
            stopTyping(msg);

            return msg.reply(`looks like ${player.displayName} doesn't have any chips yet, they can use the \`${msg.guild.commandPrefix}chips\` command to get their first 500`);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER, lasttopup TEXT);`)
                    .run();

                return msg.reply(`looks like ${player.displayName} doesn't have any chips yet, they can use the \`${msg.guild.commandPrefix}chips\` command to get their first 500`);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`memberbalance\` command!
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
