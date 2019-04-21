/**
 * @file Moderation CountdownAddCommand - Store a countdown message
 *
 * Countdown messages are sent every 24 hours in a given channel and count down to a certain event
 *
 * For the date you should not have any spaces and it is strongly recommended to use [ISO
 *     8601](https://en.wikipedia.org/wiki/ISO_8601)
 *
 * They will automatically get deleted when the event time is reached
 *
 * Optionally, you can make Ribbon tag @everyone or @here when the event time is reached by adding \`--everyone\` or
 *     \`--here\` anywhere in the countdown content
 *
 * You can save multiple messages for varying events and channels by using this command multiple times
 *
 * The first time the message will be send is the next periodic check Ribbon will do (which is every 3 minutes) after
 *     adding the countdown
 *
 * **Aliases**: `countdownmsg`, `countdownmessage`, `countdown`, `cam`, `cdadd`
 * @module
 * @category moderation
 * @name countdownadd
 * @example countdownadd 2018-12-31T18:00 #general New years day!
 * @param {string} DateTime The date (and time) of the event
 * @param {ChannelResolvable} Channel The channel to send countdown reminders in
 * @param {string} Message  The message to repeat
 */

import { deleteCommandMessages, logModMessage, startTyping, stopTyping, validatePermissions } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import 'moment-duration-format';
import path from 'path';

export default class CountdownAddCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'countdownadd',
            aliases: ['countdownmsg', 'countdownmessage', 'countdown', 'cam', 'cdadd'],
            group: 'moderation',
            memberName: 'countdownadd',
            description: 'Store a countdown message',
            format: 'DateTime Channel Message',
            details: stripIndents`
                Countdown messages are sent every 24 hours in a given channel and count down to a certain event
                For the date you should not have any spaces and it is strongly recommended to use [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)
                They will automatically get deleted when the event time is reached
                Optionally, you can make Ribbon tag @everyone or @here when the event time is reached by adding \`--everyone\` or \`--here\` anywhere in the countdown content
                You can save multiple messages for varying events and channels by using this command multiple times
                The first time the message will be send is the next periodic check Ribbon will do (which is every 3 minutes) after adding the countdown`,
            examples: ['countdownadd 2018-12-31T18:00 #general New years day!'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'datetime',
                    prompt:
                        'At which datetime should the message(s) be repeated?',
                    type: 'string',
                    validate: (v: string) =>
                        moment(v).isValid()
                            ? true
                            : stripIndents`
                                timestamp has to be a valid ISO 8601 timestamp, please see https://en.wikipedia.org/wiki/ISO_8601.
                                __Examples:__
                                \`2018-12-31 18:00\` (\`YYYY-MM-DD HH:mm\`)
                                \`2018-12-31 6:00 PM\` (\`YYYY-MM-DD hh:mm\`)
                            `,
                    parse: (p: string) => moment(p).format('YYYY-MM-DD HH:mm'),
                },
                {
                    key: 'cdChannel',
                    prompt: 'In what channel should the countdown be repeated?',
                    type: 'channel',
                },
                {
                    key: 'content',
                    prompt: 'To what should I count down?',
                    type: 'string',
                }
            ],
        });
    }

    public hasPermission = (msg: CommandoMessage) => validatePermissions('MANAGE_MESSAGES', msg, this.client, false);

    public run (msg: CommandoMessage, { datetime, cdChannel, content, tag = 'none' }: { datetime: string; cdChannel: TextChannel; content: string; tag?: string; }) {
        startTyping(msg);
        const conn = new Database(path.join(__dirname, '../../data/databases/countdowns.sqlite3'));
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const countdownEmbed = new MessageEmbed();

        try {
            startTyping(msg);

            if (/(?:--everyone)/i.test(content)) {
                tag = 'everyone';
                content =
                    content.substring(0, content.indexOf('--everyone')) +
                    content.substring(content.indexOf('--everyone') + '--everyone'.length + 1);
            } else if (/(?:--here)/i.test(content)) {
                tag = 'here';
                content =
                    content.substring(0, content.indexOf('--here')) +
                    content.substring(content.indexOf('--here') + '--here'.length + 1);
            }

            conn.prepare(`INSERT INTO "${msg.guild.id}" (datetime, channel, content, tag, lastsend) VALUES ($datetime, $channel, $content, $tag, $lastsend);`)
                .run({
                    datetime,
                    tag,
                    channel: cdChannel.id,
                    content: stripIndents`${content}`,
                    lastsend: moment().subtract(1, 'hour').format('YYYY-MM-DD HH:mm'),
                });

            return this.sendRes(this.client, msg, datetime, cdChannel, content, tag, countdownEmbed, modlogChannel);
        } catch (err) {
            stopTyping(msg);
            if (/(?:no such table)/i.test(err.toString())) {
                conn.prepare(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}" (id INTEGER PRIMARY KEY AUTOINCREMENT, datetime TEXT, channel TEXT, content TEXT, tag TEXT, lastsend TEXT);`)
                    .run();

                conn.prepare(`INSERT INTO "${msg.guild.id}" (datetime, channel, content, tag, lastsend) VALUES ($datetime, $channel, $content, $tag, $lastsend);`)
                    .run({
                        content,
                        datetime,
                        tag,
                        channel: cdChannel.id,
                        lastsend: moment().subtract(1, 'hour').format('YYYY-MM-DD HH:mm'),
                    });

                return this.sendRes(this.client, msg, datetime, cdChannel, content, tag, countdownEmbed, modlogChannel);
            }

            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`countdownadd\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **datetime:** ${moment(datetime).format('YYYY-MM-DD HH:mm')}
                **Channel:** ${channel.name} (${channel.id})>
                **Message:** ${content}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }

    private sendRes (client: CommandoClient, msg: CommandoMessage, datetime: string, channel: TextChannel, content: string, tag: string, embed: MessageEmbed, logCh: string) {
        embed
            .setColor('#9EF7C1')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** Countdown stored
                **Event at:** ${moment(datetime).format('YYYY-MM-DD HH:mm')}
                **Countdown Duration:** ${moment.duration(moment(datetime).diff(moment(), 'days'), 'days').format('w [weeks][, ] d [days] [and] h [hours]')}
                **Tag on event:** ${tag === 'none' ? 'No one' : `@${tag}`}
                **Channel:** <#${channel.id}>
                **Message:** ${content}`
            )
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, logCh, msg.guild.channels.get(logCh) as TextChannel, embed);
        }

        deleteCommandMessages(msg, client);
        stopTyping(msg);

        return msg.embed(embed);
    }
}
