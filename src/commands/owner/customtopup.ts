/**
 * @file Owner CustomTopUpCommand - Daniël Ocean doesn't give a crap about legality
 *
 * **Aliases**: `ctu`
 * @module
 * @category owner
 * @name customtopup
 * @example ctu Biscuit 1000
 * @param {GuildMemberResolvable} AnyMember The member you want to give some chips
 * @param {number} ChipsAmount The amount of chips you want to give
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import path from 'path';
import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR, deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components';

export default class CustomTopUpCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'customtopup',
            aliases: ['ctu'],
            group: 'owner',
            memberName: 'customtopup',
            description: 'Daniël Ocean doesn\'t give a crap about legality',
            format: 'AnyMember ChipsAmount',
            examples: ['ctu Biscuit 1000'],
            guildOnly: false,
            ownerOnly: true,
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
                    parse: (chips: string) => roundNumber(Number(chips)),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { player, chips }: { player: GuildMember; chips: number }) {
        startTyping(msg);
        const coinEmbed = new MessageEmbed();
        const conn = new Database(path.join(__dirname, '../../data/databases/casino.sqlite3'));

        coinEmbed
            .setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ format: 'png' }))
            .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

        try {
            let { balance } = conn.prepare(`SELECT balance FROM "${msg.guild.id}" WHERE userID = ?;`).get(player.id);

            if (balance >= 0) {
                const prevBal = balance;

                balance += chips;

                conn.prepare(`UPDATE "${msg.guild.id}" SET balance=$balance WHERE userID="${player.id}";`)
                    .run({ balance });

                coinEmbed
                    .setTitle('Daniël Ocean has stolen chips for you')
                    .addField('Previous Balance', prevBal, true)
                    .addField('New Balance', balance, true);

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(coinEmbed);
            }

            stopTyping(msg);

            return msg.reply('looks like that member has no chips yet');
        } catch (err) {
            stopTyping(msg);
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
		        <@${this.client.owners[0].id}> Error occurred in \`customtopup\` command!
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
