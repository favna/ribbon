/**
 * @file Extra CopyPastaRemoveCommand - Remove a specified copypasta
 *
 * Use the copypastalist command to find the ID for deleting
 *
 * **Aliases**: `cpremove`, `copypastadelete`, `cpdelete`, `cpd`, `cpr`, `pastadelete`, `pasteremove`
 * @module
 * @category extra
 * @name copypastaremove
 * @example copypastaremove 1
 * @param {string} CopyPastaID The ID of the Copypasta to remove
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import 'moment-duration-format';
import * as path from 'path';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components';

export default class CopyPastaRemoveCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'copypastaremove',
            aliases: ['cpremove', 'copypastadelete', 'cpdelete', 'cpd', 'cpr', 'pastadelete', 'pasteremove'],
            group: 'moderation',
            memberName: 'copypastaremove',
            description: 'Remove a specified copypasta',
            format: 'CopyPastaID',
            details: 'Use the copypastalist command to find the ID for deleting',
            examples: ['copypastaremove 1'],
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'id',
                    prompt: 'Which Copypasta should I delete?',
                    type: 'integer',
                    validate: (v: string, msg: CommandoMessage) => {
                        try {
                            const conn = new Database(path.join(__dirname, '../../data/databases/pastas.sqlite3'));
                            const rows = conn.prepare(`SELECT id FROM "${msg.guild.id}";`).all();
                            if (rows.some(el => el.id === Number(v))) return true;
                            return `that is not an ID of a Copypasta stored for this guild. You can view all the stored pastas with the \`${msg.guild.commandPrefix}copypastalist\` command`;
                        } catch (err) {
                            return msg.reply(`no pastas saved for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``);
                        }
                    },
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { id }: { id: string }) {
        try {
            startTyping(msg);

            const conn = new Database(path.join(__dirname, '../../data/databases/pastas.sqlite3'));
            const modlogChannel = msg.guild.settings.get('modlogchannel', null);
            const cprEmbed = new MessageEmbed();
            const { name, content } = conn.prepare(`SELECT name, content from "${msg.guild.id}" WHERE id = ?`).get(id);

            conn.prepare(`DELETE FROM "${msg.guild.id}" WHERE id = ?`).run(id);

            cprEmbed
                .setColor('#F7F79D')
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
                .setDescription(stripIndents`
                    **Action:** Copypasta removed
                    **Name was:** ${name}
                    **Content was:** ${content.length <= 1800 ? content : `${content.slice(0, 1800)}...`}`
                )
                .setTimestamp();

            if (msg.guild.settings.get('modlogs', true)) {
                modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, cprEmbed);
            }

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(cprEmbed);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                return msg.reply(`no pastas found for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``);
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
		        <@${this.client.owners[0].id}> Error occurred in the \`copypastaremove\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **ID:** ${id}
		        **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
