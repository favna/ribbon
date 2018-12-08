/**
 * @file Moderation WarnCommand - Gives a member warning points
 *
 * Please note that Ribbon will not auto ban when the member has a certain amount of points!
 *
 * **Aliases**: `warning`
 * @module
 * @category moderation
 * @name warn
 * @example warn Biscuit 5 Not giving everyone cookies
 * @param {GuildMemberResolvable} AnyMember The member to give warning points
 * @param {number} WarningPoints The amount of warning points to give
 * @param {string} TheReason Reason for warning
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping } from '../../components';

export default class WarnCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'warn',
            aliases: ['warning'],
            group: 'moderation',
            memberName: 'warn',
            description: 'Warn a member with a specified amount of points',
            format: 'MemberID|MemberName(partial or full) AmountOfWarnPoints ReasonForWarning',
            examples: ['warn JohnDoe 1 annoying'],
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'member',
                    prompt: 'Which member should I give a warning?',
                    type: 'member',
                },
                {
                    key: 'points',
                    prompt:
                        'How many warning points should I give this member?',
                    type: 'integer',
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason for this warning?',
                    type: 'string',
                    default: '',
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { member, points, reason }: { member: GuildMember; points: number; reason: string }) {
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
            let newPoints = points;
            let previousPoints = null;

            if (query) {
                previousPoints = query.points;
                newPoints += query.points;
                conn.prepare(`UPDATE "${msg.guild.id}" SET points=$points WHERE id="${member.id}";`)
                    .run({ points: newPoints });
            } else {
                previousPoints = 0;
                conn.prepare(`INSERT INTO "${msg.guild.id}" VALUES ($id, $tag, $points);`)
                    .run({ points, id: member.id, tag: member.user.tag });
            }

            warnEmbed.setDescription(stripIndents`
                **Member:** ${member.user.tag} (${member.id})
                **Action:** Warn
                **Previous Warning Points:** ${previousPoints}
                **Current Warning Points:** ${newPoints}
                **Reason:** ${reason !== '' ? reason : 'No reason has been added by the moderator'}
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
                        points,
                        id: member.id,
                        tag: member.user.tag,
                    });
            } else {
                const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

                channel.send(stripIndents`
                    <@${this.client.owners[0].id}> Error occurred in \`warn\` command!
                    **Server:** ${msg.guild.name} (${msg.guild.id})
                    **Author:** ${msg.author.tag} (${msg.author.id})
                    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                    **Input:** \`${member.user.tag} (${member.id})\`|| \`${points}\` || \`${reason}\`
                    **Error Message:** ${err}
              `);

                return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
            }
        }
        warnEmbed.setDescription(stripIndents`
            **Member:** ${member.user.tag} (${member.id})
            **Action:** Warn
            **Previous Warning Points:** 0
            **Current Warning Points:** ${points}
            **Reason:** ${reason !== '' ? reason : 'No reason has been added by the moderator'}
        `);

        deleteCommandMessages(msg, this.client);

        return msg.embed(warnEmbed);
    }
}
