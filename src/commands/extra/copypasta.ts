/**
 * @file Extra CopyPastaCommand - Sends a copypasta to the chat
 *
 * Note: It is possible to get copypastas with more than 2000 characters. Ask me to add it through my server!
 *
 * **Aliases**: `cp`, `pasta`
 * @module
 * @category extra
 * @name copypasta
 * @example copypasta navy
 * @param {string} PastaName Name of the copypasta to send
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel, Util } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import dym from 'didyoumean2';
import moment from 'moment';
import path from 'path';
import { CopypastaType, DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class CopyPastaCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'copypasta',
            aliases: ['cp', 'pasta'],
            group: 'extra',
            memberName: 'copypasta',
            description: 'Sends a copypasta to the chat',
            format: 'CopypastaName',
            examples: ['copypasta navy'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'name',
                    prompt: 'Which copypasta should I send?',
                    type: 'string',
                    parse: (p: string) => p.toLowerCase(),
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { name }: { name: string }) {
        const conn = new Database(path.join(__dirname, '../../data/databases/pastas.sqlite3'));
        const pastaEmbed = new MessageEmbed();

        try {
            startTyping(msg);
            const query: CopypastaType = conn
                .prepare(`SELECT * FROM "${msg.guild.id}" WHERE name = ?;`)
                .get(name);

            if (query) {
                const image = query.content.match(/(https?:\/\/.*\.(?:png|jpg|gif|webp|jpeg|svg))/im);

                if (image) {
                    pastaEmbed.setImage(image[0]);
                    query.content = query.content.replace(/([<>])/gm, '');
                    query.content =
                        query.content.substring(0, (image.index as number) - 1) +
                        query.content.substring((image.index as number) + image[0].length);
                }

                if (query.content.length >= 1800) {
                    const splitContent = Util.splitMessage(query.content, {
                        maxLength: 1800,
                    });

                    for (const part of splitContent) {
                        await msg.say(part);
                    }
                    stopTyping(msg);

                    return null;
                }

                pastaEmbed
                    .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
                    .setTitle(query.name)
                    .setDescription(query.content);

                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.embed(pastaEmbed);
            }

            const maybe = dym(name, conn.prepare(`SELECT name FROM "${msg.guild.id}";`).all().map((a: CopypastaType) => a.name), { deburr: true });

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(
                oneLine`that copypasta does not exist! ${maybe
                    ? oneLine`Did you mean \`${maybe}\`?`
                    : `You can save it with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``
                    }`
            );
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                return msg.reply(`no pastas saved for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``);
            }
            const channel = this.client.channels.get((process.env.ISSUE_LOG_CHANNEL_ID as string)) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`copypasta\` command!
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
