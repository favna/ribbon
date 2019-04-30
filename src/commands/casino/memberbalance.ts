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

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import path from 'path';

type MemberBalanceArgs = {
    player: GuildMember;
};

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

    public run (msg: CommandoMessage, { player }: MemberBalanceArgs) {
        const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));
        const mbalEmbed = new MessageEmbed();

        mbalEmbed
            .setAuthor(player.displayName, player.user.displayAvatarURL())
            .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

        try {
            const { balance } = conn.prepare(`SELECT balance FROM "${msg.guild.id}" WHERE userID = ?;`).get(player.id);

            if (balance >= 0) {
                mbalEmbed.setDescription(stripIndents`
                    **Balance**
                    ${balance}
                `);

                deleteCommandMessages(msg, this.client);

                return msg.embed(mbalEmbed);
            }

            return msg.reply(`looks like ${player.displayName} doesn't have any chips yet, they can use the \`${msg.guild.commandPrefix}chips\` command to get their first 500`);
        } catch (err) {
            if (/(?:no such table|Cannot destructure property)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (userID TEXT PRIMARY KEY, balance INTEGER , lastdaily TEXT , lastweekly TEXT , vault INTEGER);`)
                    .run();

                return msg.reply(`looks like ${player.displayName} doesn't have any chips yet, they can use the \`${msg.guild.commandPrefix}chips\` command to get their first 500`);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`memberbalance\` command!
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
