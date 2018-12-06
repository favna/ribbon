/**
 * @file Moderation DeleteWarnCommand - Deletes all or some warnings points from a user
 *
 * **Aliases**: `removewarn`, `unwarn`, `dw`, `uw`
 * @module
 * @category moderation
 * @name deletewarn
 * @example deletewarn favna
 * @example deletewarn favna
 * @param {MemberResolvable} AnyMember The member to remove warning points from
 * @param {Number} [AmountOfWarnPoints] The amount of warning points to remove
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components';

export default class DeleteWarnCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'deletewarn',
            aliases: ['removewarn', 'unwarn', 'dw', 'uw'],
            group: 'moderation',
            memberName: 'deletewarn',
            description: 'Deletes all or some warnings points from a user',
            format: 'MemberID|MemberName(partial or full) [AmountOfWarnPoints]',
            examples: ['deletewarn favna', 'deletewarn favna 5'],
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Which member should I remove warning points from?',
                    type: 'member',
                },
                {
                    key: 'points',
                    prompt: 'How many warning points should I remove from this member?',
                    type: 'integer',
                    default: 999999,
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { member, points }: { member: GuildMember; points: number }) {
        const conn = new Database(path.join(__dirname, '../../data/databases/warnings.sqlite3'));
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const warnEmbed = new MessageEmbed();

        warnEmbed
            .setColor('#FFFF00')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setTimestamp();

        try {
            startTyping(msg);

            const query = conn.prepare(`SELECT id,points FROM "${msg.guild.id}" WHERE id = ?;`).get(member.id);

            if (!query) return msg.reply('that user has no warnings points yet');

            const previousPoints = query.points;
            let newPoints = points === 999999 ? 0 : query.points - points;

            if (newPoints < 0) newPoints = 0;

            conn.prepare(`UPDATE "${msg.guild.id}" SET points=$points WHERE id="${member.id}";`)
                .run({ points: newPoints });

            warnEmbed.setDescription(stripIndents`
                **Member:** ${member.user.tag} (${member.id})
                **Action:** Removed Warnings
                **Previous Warning Points:** ${previousPoints}
                **Current Warning Points:** ${newPoints}
            `);

            if (msg.guild.settings.get('modlogs', true)) {
                modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, warnEmbed);
            }

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(warnEmbed);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (id TEXT PRIMARY KEY, tag TEXT, points INTEGER);`)
                    .run();

                conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($id, $tag, $points);`)
                    .run({
                        id: member.id,
                        points: 0,
                        tag: member.user.tag,
                    });

                return msg.reply('there were no warnings for that user yet, I created an entry and assigned 0 points');
            }
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`deletewarn\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** \`${member.user.tag} (${member.id})\`|| \`${points}\`
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
