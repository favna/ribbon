/**
 * @file Moderation TimerAddCommand - Store timed messages
 *
 * These are messages Ribbon will repeat in a given channel on a given interval
 *
 * Useful for repeating about rules and such
 *
 * You can save multiple messages with varying intervals and channels by using this command multiple times
 *
 * The first time the message will be send is the next periodic check Ribbon will do (which is every 3 minutes) after
 *     adding the timed message
 *
 * The format for the interval is in minutes, hours or days in the format of `5m`, `2h` or `1d`
 *
 * **Aliases**: `timedmsgs`, `timedmsg`, timedmessages`, `timer`, `tm`
 * @module
 * @category moderation
 * @name timeradd
 * @example timeradd 1d #general Please read the rules everyone!
 * @param {string} Interval The interval at which the message(s) should be repeated
 * @param {ChannelResolvable} Channel The channel to send the timed message in
 * @param {string} Message  The message(s) to repeat
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import path from 'path';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, timeparseHelper } from '../../components';

export default class TimerAddCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'timeradd',
            aliases: ['timedmsgs', 'timedmsg', 'timedmessages', 'timer', 'tm'],
            group: 'moderation',
            memberName: 'timeradd',
            description: 'Store timed messages',
            format: 'Interval Channel Message',
            details: stripIndents`These are messages Ribbon will repeat in a given channel on a given interval
                Useful for repeating about rules and such
                You can save multiple messages with varying intervals and channels by using this command multiple times
                The first time the message will be send is the next periodic check Ribbon will do (which is every 3 minutes) after adding the timed message
                The format for the interval is in minutes, hours or days in the format of \`5m\`, \`2h\` or \`1d\``,
            examples: ['timeradd 1d #general Please read the rules everyone!'],
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'interval',
                    prompt: 'At which interval should the message(s) be repeated?',
                    type: 'string',
                    validate: (t: string) => {
                        if (/^(?:[0-9]{1,3}(?:m|min|mins|minute|minutes|h|hr|hour|hours|d|day|days){1})$/i.test(t)) return true;
                        return stripIndents`
                            Time until reminder has to be a formatting of \`Number\` \`Specification\`. Specification can have various option:
                            - \`m\` , \`min\`, \`mins\`, \`minute\` or \`minutes\` for minutes
                            - \`h\`, \`hr\`, \`hour\` or \`hours\` for hours
                            - \`d\`, \`day\` or \`days\` for days

                            Example: \`5m\` for 5 minutes from now; \`1d\` for 1 day from now
                            Please reply with your properly formatted time until reminder or`;
                    },
                    parse: (t: string) => {
                        const match = t.match(/[a-z]+|[^a-z]+/gi);
                        let multiplier = 1;

                        switch (match[1]) {
                            case 'm':
                                multiplier = 1;
                                break;
                            case 'h':
                                multiplier = 60;
                                break;
                            case 'd':
                                multiplier = 1440;
                                break;
                            default:
                                multiplier = 1;
                                break;
                        }

                        return Number(match[0]) * multiplier * 60000;
                    },
                },
                {
                    key: 'timerChannel',
                    prompt: 'In what channel should the message be repeated?',
                    type: 'channel',
                },
                {
                    key: 'content',
                    prompt: 'What message should I repeat?',
                    type: 'string',
                },
                {
                    key: 'members',
                    prompt: 'Should any members be mentioned for this timer?',
                    type: 'member',
                    default: [],
                    infinite: true,
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { interval, timerChannel, content, members }: { interval: number; timerChannel: TextChannel; content: string; members?: GuildMember[]; }) {
        startTyping(msg);
        const conn = new Database(path.join(__dirname, '../../data/databases/timers.sqlite3'));
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const timedMsgEmbed = new MessageEmbed();

        try {
            startTyping(msg);
            conn.prepare(`INSERT INTO "${msg.guild.id}" (interval, channel, content, lastsend, members) VALUES ($interval, $channel, $content, $lastsend, $members);`)
                .run({
                    content,
                    interval,
                    channel: timerChannel.id,
                    lastsend: moment().subtract(interval, 'ms').format('YYYY-MM-DD HH:mm'),
                    members: members.length ? members.map(member => member.id).join(';') : '',
                });
            stopTyping(msg);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (id INTEGER PRIMARY KEY AUTOINCREMENT, interval INTEGER, channel TEXT, content TEXT, lastsend TEXT, members TEXT);`)
                    .run();

                conn.prepare(`INSERT INTO "${msg.guild.id}" (interval, channel, content, lastsend, members) VALUES ($interval, $channel, $content, $lastsend, $members);`)
                    .run({
                        content,
                        interval,
                        channel: timerChannel.id,
                        lastsend: moment()
                            .subtract(interval, 'ms')
                            .format('YYYY-MM-DD HH:mm'),
                        members: members.length
                            ? members.map(member => member.id).join(';')
                            : '',
                    });
            } else {
                const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

                channel.send(stripIndents`
                    <@${this.client.owners[0].id}> Error occurred in \`timeradd\` command!
                    **Server:** ${msg.guild.name} (${msg.guild.id})
                    **Author:** ${msg.author.tag} (${msg.author.id})
                    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                    **Interval:** ${timeparseHelper(interval, { long: true })}
                    **Channel:** ${channel.name} (${channel.id})>
                    **Message:** ${content}
                    **Error Message:** ${err}
                `);

                return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
            }
        }

        timedMsgEmbed
            .setColor('#9EF7C1')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** Timed message stored
                **Interval:** ${timeparseHelper(interval, { long: true })}
                **Channel:** <#${timerChannel.id}>
                **Message:** ${content}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, timedMsgEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(timedMsgEmbed);
    }
}
