/**
 * @file Ribbon Events - Events handled by Ribbon
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @copyright © 2017-2018 Favna
 */

import * as Database from 'better-sqlite3';
import { oneLine, stripIndents } from 'common-tags';
import {
    GuildMember,
    MessageAttachment,
    MessageEmbed,
    RateLimitData,
    Snowflake,
    TextChannel,
} from 'discord.js';
import {
    Command,
    CommandoClient,
    CommandoGuild,
    CommandoMessage,
} from 'discord.js-commando';
import * as fs from 'fs';
import * as Jimp from 'jimp';
import * as moment from 'moment';
import 'moment-duration-format';
import eshop from 'nintendo-switch-eshop';
import fetch from 'node-fetch';
import * as path from 'path';
import {
    badwords,
    caps,
    decache,
    duptext,
    emojis,
    invites,
    links,
    mentions,
    ms,
    ordinal,
    slowmode,
    stringify,
} from '.';

const renderReminderMessage = async (client: CommandoClient) => {
    const conn = new Database(
        path.join(__dirname, '../data/databases/reminders.sqlite3')
    );

    try {
        const query = conn.prepare('SELECT * FROM "reminders"').all();

        for (const row in query) {
            const remindTime = moment(query[row].remindTime);
            const dura = moment.duration(remindTime.diff(moment()));

            if (dura.asMinutes() <= 0) {
                const user = await client.users.fetch(query[row].userID);

                user.send({
                    embed: {
                        author: {
                            iconURL: client.user.displayAvatarURL({
                                format: 'png',
                            }),
                            name: 'Ribbon Reminders',
                        },
                        color: 10610610,
                        description: query[row].remindText,
                        thumbnail: {
                            url:
                                'https://favna.xyz/images/ribbonhost/reminders.png',
                        },
                    },
                });
                conn.prepare(
                    'DELETE FROM "reminders" WHERE userID = $userid AND remindTime = $remindTime'
                ).run({
                    remindTime: query[row].remindTime,
                    userid: query[row].userID,
                });
            }
        }
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${
                client.owners[0].id
            }> Error occurred sending someone their reminder!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }
};

const renderCountdownMessage = (client: CommandoClient) => {
    const conn = new Database(
        path.join(__dirname, '../data/databases/countdowns.sqlite3')
    );

    try {
        const tables = conn
            .prepare(
                'SELECT name FROM sqlite_master WHERE type=\'table\' AND name != \'sqlite_sequence\';'
            )
            .all();

        for (const table in tables) {
            const rows = conn
                .prepare(`SELECT * FROM "${tables[table].name}"`)
                .all();

            for (const row in rows) {
                const cdmoment = moment(rows[row].lastsend).add(24, 'hours');
                const dura = moment.duration(cdmoment.diff(moment()));

                if (dura.asMinutes() <= 0) {
                    const guild = client.guilds.get(tables[table].name);
                    const channel = guild.channels.get(
                        rows[row].channel
                    ) as TextChannel;
                    const countdownEmbed = new MessageEmbed();
                    const { me } = client.guilds.get(tables[table].name);

                    countdownEmbed
                        .setAuthor(
                            'Countdown Reminder',
                            me.user.displayAvatarURL({ format: 'png' })
                        )
                        .setColor(me.displayHexColor)
                        .setTimestamp().setDescription(stripIndents`
                            Event on: ${moment(rows[row].datetime).format(
                                'MMMM Do YYYY [at] HH:mm'
                            )}
                            That is: ${moment
                                .duration(
                                    moment(rows[row].datetime).diff(
                                        moment(),
                                        'days'
                                    ),
                                    'days'
                                )
                                .format(
                                    'w [weeks][, ] d [days] [and] h [hours]'
                                )}

                            **__${rows[row].content}__**
                        `);

                    if (
                        moment(rows[row].datetime).diff(new Date(), 'hours') >=
                        24
                    ) {
                        conn.prepare(
                            `UPDATE "${
                                tables[table].name
                            }" SET lastsend=$lastsend WHERE id=$id;`
                        ).run({
                            id: rows[row].id,
                            lastsend: moment().format('YYYY-MM-DD HH:mm'),
                        });

                        channel.send('', { embed: countdownEmbed });
                    } else {
                        conn.prepare(
                            `DELETE FROM "${tables[table].name}" WHERE id=$id;`
                        ).run({ id: rows[row].id });

                        switch (rows[row].tag) {
                            case 'everyone':
                                channel.send('@everyone GET HYPE IT IS TIME!', {
                                    embed: countdownEmbed,
                                });
                                break;
                            case 'here':
                                channel.send('@here GET HYPE IT IS TIME!', {
                                    embed: countdownEmbed,
                                });
                                break;
                            default:
                                channel.send('GET HYPE IT IS TIME!', {
                                    embed: countdownEmbed,
                                });
                                break;
                        }
                    }
                }
            }
        }
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${client.owners[0].id}> Error occurred sending a countdown!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }
};

const renderJoinMessage = async (member: GuildMember) => {
    try {
        const avatar = await Jimp.read(
            member.user.displayAvatarURL({ format: 'png' })
        );
        const border = await Jimp.read(
            'https://www.favna.xyz/images/ribbonhost/jimp/border.png'
        );
        const canvas = await Jimp.read(500, 150);
        const newMemberEmbed = new MessageEmbed();
        const fontLarge = await Jimp.loadFont(
            path.join(__dirname, '../data/fonts/roboto-large.fnt')
        );
        const fontMedium = await Jimp.loadFont(
            path.join(__dirname, '../data/fonts/roboto-medium.fnt')
        );
        const mask = await Jimp.read(
            'https://www.favna.xyz/images/ribbonhost/jimp/mask.png'
        );

        avatar.resize(136, Jimp.AUTO);
        mask.resize(136, Jimp.AUTO);
        border.resize(136, Jimp.AUTO);
        avatar.mask(mask, 0, 0);
        avatar.composite(border, 0, 0);
        canvas.blit(avatar, 5, 5);
        canvas.print(fontLarge, 155, 10, 'welcome'.toUpperCase());
        canvas.print(
            fontMedium,
            160,
            60,
            `you are the ${ordinal(
                member.guild.memberCount
            )} member`.toUpperCase()
        );
        canvas.print(
            fontMedium,
            160,
            80,
            `of ${member.guild.name}`.toUpperCase()
        );

        const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
        const embedAttachment = new MessageAttachment(buffer, 'joinimg.png');

        newMemberEmbed
            .attachFiles([embedAttachment])
            .setColor('#80F31F')
            .setTitle('NEW MEMBER!')
            .setDescription(
                `Please give a warm welcome to __**${
                    member.displayName
                }**__  (\`${member.id}\`)`
            )
            .setImage('attachment://joinimg.png');

        const guild = member.guild as CommandoGuild;
        const channel = member.guild.channels.get(
            guild.settings.get('joinmsgchannel')
        ) as TextChannel;

        return channel.send(`Welcome <@${member.id}> 🎗️!`, {
            embed: newMemberEmbed,
        });
    } catch (err) {
        return null;
    }
};

const renderLeaveMessage = async (member: GuildMember) => {
    try {
        const avatar = await Jimp.read(
            member.user.displayAvatarURL({ format: 'png' })
        );
        const border = await Jimp.read(
            'https://www.favna.xyz/images/ribbonhost/jimp/border.png'
        );
        const canvas = await Jimp.read(500, 150);
        const leaveMemberEmbed = new MessageEmbed();
        const fontMedium = await Jimp.loadFont(
            path.join(__dirname, '../data/fonts/roboto-medium.fnt')
        );
        const fontLarge = await Jimp.loadFont(
            path.join(__dirname, '../data/fonts/roboto-large.fnt')
        );
        const mask = await Jimp.read(
            'https://www.favna.xyz/images/ribbonhost/jimp/mask.png'
        );

        avatar.resize(136, Jimp.AUTO);
        mask.resize(136, Jimp.AUTO);
        border.resize(136, Jimp.AUTO);
        avatar.mask(mask, 0, 0);
        avatar.composite(border, 0, 0);
        canvas.blit(avatar, 5, 5);
        canvas.print(fontLarge, 155, 10, 'goodbye'.toUpperCase());
        canvas.print(
            fontMedium,
            160,
            60,
            `there are now ${member.guild.memberCount} members`.toUpperCase()
        );
        canvas.print(
            fontMedium,
            160,
            80,
            `on ${member.guild.name}`.toUpperCase()
        );

        const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
        const embedAttachment = new MessageAttachment(buffer, 'leaveimg.png');

        leaveMemberEmbed
            .attachFiles([embedAttachment])
            .setColor('#F4BF42')
            .setTitle('Member Left 😢')
            .setDescription(
                `You will be missed __**${member.displayName}**__ (\`${
                    member.id
                }\`)`
            )
            .setImage('attachment://leaveimg.png');

        const guild = member.guild as CommandoGuild;
        const channel = member.guild.channels.get(
            guild.settings.get('leavemsgchannel')
        ) as TextChannel;

        return channel.send('', { embed: leaveMemberEmbed });
    } catch (err) {
        return null;
    }
};

const renderLottoMessage = (client: CommandoClient) => {
    const conn = new Database(
        path.join(__dirname, '../data/databases/casino.sqlite3')
    );

    try {
        const tables = conn
            .prepare('SELECT name FROM sqlite_master WHERE type=\'table\'')
            .all();

        for (const table in tables) {
            if (client.guilds.get(tables[table].name)) {
                const rows = conn
                    .prepare(`SELECT * FROM "${tables[table].name}"`)
                    .all();
                const winner = Math.floor(Math.random() * rows.length);
                const prevBal = rows[winner].balance;

                rows[winner].balance += 2000;

                conn.prepare(
                    `UPDATE "${
                        tables[table].name
                    }" SET balance=$balance WHERE userID="${
                        rows[winner].userID
                    }"`
                ).run({ balance: rows[winner].balance });

                const defaultChannel = client.guilds.get(tables[table].name)
                    .systemChannel;
                const winnerEmbed = new MessageEmbed();
                const winnerMember: GuildMember = client.guilds
                    .get(tables[table].name)
                    .members.get(rows[winner].userID);
                if (!winnerMember) continue;
                const winnerLastMessageChannelId: Snowflake =
                    winnerMember.lastMessageChannelID;
                const winnerLastMessageChannel: TextChannel = winnerLastMessageChannelId
                    ? (client.guilds
                          .get(tables[table].name)
                          .channels.get(
                              winnerLastMessageChannelId
                          ) as TextChannel)
                    : null;
                const winnerLastMessageChannelPermitted: boolean = winnerLastMessageChannel
                    ? winnerLastMessageChannel
                          .permissionsFor(client.user)
                          .has('SEND_MESSAGES')
                    : false;

                winnerEmbed
                    .setColor('#7CFC00')
                    .setDescription(
                        `Congratulations <@${
                            rows[winner].userID
                        }>! You won today's random lotto and were granted 2000 chips 🎉!`
                    )
                    .setAuthor(
                        winnerMember.displayName,
                        winnerMember.user.displayAvatarURL({ format: 'png' })
                    )
                    .setThumbnail(
                        'https://favna.xyz/images/ribbonhost/casinologo.png'
                    )
                    .addField(
                        'Balance',
                        `${prevBal} ➡ ${rows[winner].balance}`
                    );

                if (winnerLastMessageChannelPermitted) {
                    winnerLastMessageChannel.send(`<@${rows[winner].userID}>`, {
                        embed: winnerEmbed,
                    });
                } else if (defaultChannel) {
                    defaultChannel.send(`<@${rows[winner].userID}>`, {
                        embed: winnerEmbed,
                    });
                }
            }
        }
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${
                client.owners[0].id
            }> Error occurred giving someone their lotto payout!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }
};

const renderTimerMessage = (client: CommandoClient) => {
    const conn = new Database(
        path.join(__dirname, '../data/databases/timers.sqlite3')
    );

    try {
        const tables = conn
            .prepare(
                'SELECT name FROM sqlite_master WHERE type=\'table\' AND name != \'sqlite_sequence\';'
            )
            .all();

        for (const table in tables) {
            const rows = conn
                .prepare(`SELECT * FROM "${tables[table].name}"`)
                .all();

            for (const row in rows) {
                const timermoment = moment(rows[row].lastsend).add(
                    rows[row].interval,
                    'ms'
                );
                const dura = moment.duration(timermoment.diff(moment()));

                if (dura.asMinutes() <= 0) {
                    conn.prepare(
                        `UPDATE "${
                            tables[table].name
                        }" SET lastsend=$lastsend WHERE id=$id;`
                    ).run({
                        id: rows[row].id,
                        lastsend: moment().format('YYYY-MM-DD HH:mm'),
                    });
                    const guild = client.guilds.get(tables[table].name);
                    const channel = guild.channels.get(
                        rows[row].channel
                    ) as TextChannel;
                    const timerEmbed = new MessageEmbed();
                    const { me } = client.guilds.get(tables[table].name);
                    const memberMentions = rows[row].members
                        ? rows[row].members
                              .split(';')
                              .map((member: Snowflake) => `<@${member}>`)
                              .join(' ')
                        : null;

                    timerEmbed
                        .setAuthor(
                            'Ribbon Timed Message',
                            me.user.displayAvatarURL({ format: 'png' })
                        )
                        .setColor(me.displayHexColor)
                        .setDescription(rows[row].content)
                        .setTimestamp();

                    channel.send(memberMentions ? memberMentions : '', {
                        embed: timerEmbed,
                    });
                }
            }
        }
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${client.owners[0].id}> Error occurred sending a timed message!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }
};

const forceEshopUpdate = async (client: CommandoClient) => {
    try {
        fs.writeFileSync(
            path.join(__dirname, '../data/databases/eshop.json'),
            JSON.stringify(await eshop.getGamesAmerica({ shop: 'all' })),
            'utf8'
        );
        decache(path.join(__dirname, '../data/databases/eshop.json'));

        return client.registry.resolveCommand('searches:eshop').reload();
    } catch (err) {
        return null;
    }
};

const forceStopTyping = (client: CommandoClient) => {
    const allChannels = client.channels;

    for (const channel of allChannels.values()) {
        if (
            channel.type === 'text' ||
            channel.type === 'dm' ||
            channel.type === 'group'
        ) {
            if (client.user.typingDurationIn(channel) > 10000) {
                const typingChannel = channel as TextChannel;

                typingChannel.stopTyping(true);
            }
        }
    }
};

export const handleCmdErr = (
    client: CommandoClient,
    cmd: Command,
    err: Error,
    msg: CommandoMessage
) => {
    const channel = client.channels.get(
        process.env.ISSUE_LOG_CHANNEL_ID
    ) as TextChannel;

    channel.send(stripIndents`
        Caught **Command Error**!
        **Command:** ${cmd.name}
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format(
            'MMMM Do YYYY [at] HH:mm:ss [UTC]Z'
        )}
        **Error Message:** ${err}
    `);
};

export const handleDebug = (info: string) => {
    /* tslint:disable-next-line:no-console */
    console.log(info);
};

export const handleErr = (client: CommandoClient, err: string) => {
    const channel = client.channels.get(
        process.env.ISSUE_LOG_CHANNEL_ID
    ) as TextChannel;

    channel.send(stripIndents`
        Caught **WebSocket Error**!
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}
    `);
};

export const handleGuildJoin = async (
    client: CommandoClient,
    guild: CommandoGuild
) => {
    try {
        const avatar = await Jimp.read(
            client.user.displayAvatarURL({ format: 'png' })
        );
        const border = await Jimp.read(
            'https://www.favna.xyz/images/ribbonhost/jimp/border.png'
        );
        const canvas = await Jimp.read(500, 150);
        const mask = await Jimp.read(
            'https://www.favna.xyz/images/ribbonhost/jimp/mask.png'
        );
        const fontMedium = await Jimp.loadFont(
            path.join(__dirname, '../data/fonts/roboto-medium.fnt')
        );
        const newGuildEmbed = new MessageEmbed();
        const channel = guild.systemChannel ? guild.systemChannel : null;

        avatar.resize(136, Jimp.AUTO);
        mask.resize(136, Jimp.AUTO);
        border.resize(136, Jimp.AUTO);
        avatar.mask(mask, 0, 0);
        avatar.composite(border, 0, 0);
        canvas.blit(avatar, 5, 5);
        canvas.print(
            fontMedium,
            155,
            55,
            `Currently powering up ${client.guilds.size} servers`.toUpperCase()
        );
        canvas.print(
            fontMedium,
            155,
            75,
            `serving ${client.users.size} Discord users`.toUpperCase()
        );

        const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
        const embedAttachment = new MessageAttachment(buffer, 'added.png');

        newGuildEmbed
            .attachFiles([embedAttachment])
            .setColor('#80F31F')
            .setTitle('Ribbon is here!')
            .setDescription(
                stripIndents`
                I'm an all-purpose bot and I hope I can make your server better!
                I've got many commands, you can see them all by using \`${
                    client.commandPrefix
                }help\`
                Don't like the prefix? The admins can change my prefix by using \`${
                    client.commandPrefix
                }prefix [new prefix]\`

                **All these commands can also be called by mentioning me instead of using a prefix, for example \`@${
                    client.user.tag
                } help\`**
            `
            )
            .setImage('attachment://added.png');

        return channel ? channel.send('', { embed: newGuildEmbed }) : null;
    } catch (err) {
        return null;
    }
};

export const handleGuildLeave = (
    client: CommandoClient,
    guild: CommandoGuild
) => {
    guild.settings.clear();
    const casinoConn = new Database(
        path.join(__dirname, '../data/databases/casino.sqlite3')
    );
    const pastasConn = new Database(
        path.join(__dirname, '../data/databases/pastas.sqlite3')
    );
    const timerConn = new Database(
        path.join(__dirname, '../data/databases/timers.sqlite3')
    );
    const warningsConn = new Database(
        path.join(__dirname, '../data/databases/warnings.sqlite3')
    );

    try {
        casinoConn.exec(`DROP TABLE IF EXISTS "${guild.id}"`);
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${client.owners[0].id}> Failed to purge ${guild.name} (${
            guild.id
        }) from the casino database!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }

    try {
        pastasConn.exec(`DROP TABLE IF EXISTS "${guild.id}"`);
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${client.owners[0].id}> Failed to purge ${guild.name} (${
            guild.id
        }) from the pastas database!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }

    try {
        timerConn.exec(`DROP TABLE IF EXISTS "${guild.id}"`);
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${client.owners[0].id}> Failed to purge ${guild.name} (${
            guild.id
        }) from the timers database!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }

    try {
        warningsConn.exec(`DROP TABLE IF EXISTS "${guild.id}"`);
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${client.owners[0].id}> Failed to purge ${guild.name} (${
            guild.id
        }) from the warnings database!
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }
};

export const handleMemberJoin = (
    client: CommandoClient,
    joinMember: GuildMember
) => {
    const memberJoinLogEmbed = new MessageEmbed();
    const guild = joinMember.guild as CommandoGuild;

    try {
        if (
            guild.settings.get('defaultRole') &&
            guild.roles.get(guild.settings.get('defaultRole')) &&
            joinMember.manageable
        ) {
            joinMember.roles.add(guild.settings.get('defaultRole'));
            memberJoinLogEmbed.setDescription(
                `Automatically assigned the role ${
                    joinMember.guild.roles.get(
                        guild.settings.get('defaultRole')
                    ).name
                } to this member`
            );
        }
    } catch (err) {
        // Intentionally empty
    }

    try {
        if (guild.settings.get('memberlogs', true)) {
            const memberLogs = guild.settings.get(
                'memberlogchannel',
                joinMember.guild.channels.find(
                    (c: TextChannel) => c.name === 'member-logs'
                )
                    ? joinMember.guild.channels.find(
                          (c: TextChannel) => c.name === 'member-logs'
                      ).id
                    : null
            );

            memberJoinLogEmbed
                .setAuthor(
                    `${joinMember.user.tag} (${joinMember.id})`,
                    joinMember.user.displayAvatarURL({ format: 'png' })
                )
                .setFooter('User joined')
                .setTimestamp()
                .setColor('#80F31F');

            if (
                memberLogs &&
                joinMember.guild.channels.get(memberLogs) &&
                joinMember.guild.channels
                    .get(memberLogs)
                    .permissionsFor(client.user)
                    .has('SEND_MESSAGES')
            ) {
                const channel = guild.channels.get(memberLogs) as TextChannel;

                channel.send('', { embed: memberJoinLogEmbed });
            }
        }
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${
                client.owners[0].id
            }> An error sending the member join memberlog message!
            **Server:** ${joinMember.guild.name} (${joinMember.guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }

    try {
        if (
            guild.settings.get('joinmsgs', false) &&
            guild.settings.get('joinmsgchannel', null)
        ) {
            renderJoinMessage(joinMember);
        }
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${
                client.owners[0].id
            }> An error occurred sending the member join image!
            **Server:** ${joinMember.guild.name} (${joinMember.guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }
};

export const handleMemberLeave = (
    client: CommandoClient,
    leaveMember: GuildMember
): any => {
    const guild = leaveMember.guild as CommandoGuild;

    try {
        if (guild.settings.get('memberlogs', true)) {
            const memberLeaveLogEmbed = new MessageEmbed();
            const memberLogs = guild.settings.get(
                'memberlogchannel',
                leaveMember.guild.channels.find(
                    (c: TextChannel) => c.name === 'member-logs'
                )
                    ? leaveMember.guild.channels.find(
                          (c: TextChannel) => c.name === 'member-logs'
                      ).id
                    : null
            );

            memberLeaveLogEmbed
                .setAuthor(
                    `${leaveMember.user.tag} (${leaveMember.id})`,
                    leaveMember.user.displayAvatarURL({ format: 'png' })
                )
                .setFooter('User left')
                .setTimestamp()
                .setColor('#F4BF42');

            if (
                memberLogs &&
                leaveMember.guild.channels.get(memberLogs) &&
                leaveMember.guild.channels
                    .get(memberLogs)
                    .permissionsFor(client.user)
                    .has('SEND_MESSAGES')
            ) {
                const channel = guild.channels.get(memberLogs) as TextChannel;

                channel.send('', { embed: memberLeaveLogEmbed });
            }
        }
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${
                client.owners[0].id
            }> An error occurred sending the member left memberlog message!
            **Server:** ${leaveMember.guild.name} (${leaveMember.guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }

    try {
        const conn = new Database(
            path.join(__dirname, '../data/databases/casino.sqlite3')
        );
        const query = conn
            .prepare(`SELECT * FROM "${leaveMember.guild.id}" WHERE userID = ?`)
            .get(leaveMember.id);

        if (query) {
            conn.prepare(
                `DELETE FROM "${leaveMember.guild.id}" WHERE userID = ?`
            ).run(leaveMember.id);
        }
    } catch (err) {
        if (!/(?:no such table)/i.test(err.toString())) {
            const channel = client.channels.get(
                process.env.ISSUE_LOG_CHANNEL_ID
            ) as TextChannel;

            channel.send(stripIndents`
                <@${client.owners[0].id}> An error occurred removing ${
                leaveMember.user.tag
            } (${leaveMember.id}) casino data when they left the server!
                **Server:** ${leaveMember.guild.name} (${leaveMember.guild.id})
                **Time:** ${moment().format(
                    'MMMM Do YYYY [at] HH:mm:ss [UTC]Z'
                )}
                **Error Message:** ${err}
            `);
        }
    }

    try {
        if (
            guild.settings.get('leavemsgs', false) &&
            guild.settings.get('leavemsgchannel', null)
        ) {
            renderLeaveMessage(leaveMember);
        }
    } catch (err) {
        const channel = client.channels.get(
            process.env.ISSUE_LOG_CHANNEL_ID
        ) as TextChannel;

        channel.send(stripIndents`
            <@${
                client.owners[0].id
            }> An error occurred sending the member leave image!
            **Server:** ${leaveMember.guild.name} (${leaveMember.guild.id})
            **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
            **Error Message:** ${err}
        `);
    }
};

export const handleMsg = (
    client: CommandoClient,
    msg: CommandoMessage
): void => {
    const guild = msg.guild as CommandoGuild;

    if (
        msg.guild &&
        msg.deletable &&
        guild.settings.get('automod', false).enabled
    ) {
        if (
            msg.member.roles.some(ro =>
                guild.settings.get('automod', []).filterroles.includes(ro.id)
            )
        ) {
            return null;
        }
        if (guild.settings.get('caps', false).enabled) {
            const opts = guild.settings.get('caps');

            if (caps(msg, opts.threshold, opts.minlength, client)) msg.delete();
        }
        if (guild.settings.get('duptext', false).enabled) {
            const opts = guild.settings.get('duptext');

            if (duptext(msg, opts.within, opts.equals, opts.distance, client)) {
                msg.delete();
            }
        }
        if (guild.settings.get('emojis', false).enabled) {
            const opts = guild.settings.get('emojis');

            if (emojis(msg, opts.threshold, opts.minlength, client)) {
                msg.delete();
            }
        }
        if (
            guild.settings.get('badwords', false).enabled &&
            badwords(msg, guild.settings.get('badwords').words, client)
        ) {
            msg.delete();
        }
        if (guild.settings.get('invites', false) && invites(msg, client)) {
            msg.delete();
        }
        if (guild.settings.get('links', false) && links(msg, client)) {
            msg.delete();
        }
        if (
            guild.settings.get('mentions', false).enabled &&
            mentions(msg, guild.settings.get('mentions').threshold, client)
        ) {
            msg.delete();
        }
        if (
            guild.settings.get('slowmode', false).enabled &&
            slowmode(msg, guild.settings.get('slowmode').within, client)
        ) {
            msg.delete();
        }
    }
};

export const handlePresenceUpdate = async (
    client: CommandoClient,
    oldMember: GuildMember,
    newMember: GuildMember
) => {
    const guild = newMember.guild as CommandoGuild;

    if (guild.settings.get('twitchnotifiers', false)) {
        if (guild.settings.get('twitchmonitors', []).includes(newMember.id)) {
            const curDisplayName = newMember.displayName;
            const curGuild = newMember.guild as CommandoGuild;
            const curUser = newMember.user;
            let newActivity = newMember.presence.activity;
            let oldActivity = oldMember.presence.activity;

            try {
                if (!oldActivity) {
                    oldActivity = {
                        applicationID: '',
                        assets: {
                            largeImage: '',
                            largeImageURL: () => null,
                            largeText: '',
                            smallImage: '',
                            smallImageURL: () => null,
                            smallText: '',
                        },
                        details: '',
                        equals: () => null,
                        name: '',
                        party: { id: '', size: [0, 0] },
                        state: '',
                        timestamps: { start: new Date(), end: new Date() },
                        type: 'STREAMING',
                        url: 'placeholder',
                    };
                }
                if (!newActivity) {
                    newActivity = {
                        applicationID: '',
                        assets: {
                            largeImage: '',
                            largeImageURL: () => null,
                            largeText: '',
                            smallImage: '',
                            smallImageURL: () => null,
                            smallText: '',
                        },
                        details: '',
                        equals: () => null,
                        name: '',
                        party: { id: '', size: [0, 0] },
                        state: '',
                        timestamps: { start: new Date(), end: new Date() },
                        type: 'STREAMING',
                        url: 'placeholder',
                    };
                }
                if (
                    !/(twitch)/i.test(oldActivity.url) &&
                    /(twitch)/i.test(newActivity.url)
                ) {
                    const userFetch = await fetch(
                        `https://api.twitch.tv/helix/users?${stringify({
                            login: newActivity.url.split('/')[3],
                        })}`,
                        {
                            headers: {
                                'Client-ID': process.env.TWITCH_CLIENT_ID,
                            },
                        }
                    );
                    const userData = await userFetch.json();
                    const streamFetch = await fetch(
                        `https://api.twitch.tv/helix/streams?${stringify({
                            channel: userData.data[0].id,
                        })}`,
                        {
                            headers: {
                                'Client-ID': process.env.TWITCH_CLIENT_ID,
                            },
                        }
                    );
                    const streamData = await streamFetch.json();
                    const twitchChannelID = curGuild.settings.get(
                        'twitchchannelID',
                        null
                    );
                    const twitchChannel = twitchChannelID
                        ? (curGuild.channels.get(
                              twitchChannelID
                          ) as TextChannel)
                        : null;
                    const twitchEmbed = new MessageEmbed();

                    twitchEmbed
                        .setThumbnail(curUser.displayAvatarURL())
                        .setURL(newActivity.url)
                        .setColor('#6441A4')
                        .setTitle(`${curDisplayName} just went live!`)
                        .setDescription(
                            stripIndents`streaming \`${
                                newActivity.details
                            }\`!\n\n**Title:**\n${newActivity.name}`
                        );

                    if (
                        userFetch.ok &&
                        userData.data.length > 0 &&
                        userData.data[0]
                    ) {
                        twitchEmbed
                            .setThumbnail(userData.data[0].profile_image_url)
                            .setTitle(
                                `${
                                    userData.data[0].display_name
                                } just went live!`
                            )
                            .setDescription(
                                stripIndents`${
                                    userData.data[0].display_name
                                } just started ${twitchEmbed.description}`
                            )
                            .setImage(
                                `https://static-cdn.jtvnw.net/previews-ttv/live_user_${
                                    userData.data[0].login
                                }-1920x1080.jpg`
                            );
                    }

                    if (
                        streamFetch.ok &&
                        streamData.data.length > 0 &&
                        streamData.data[0]
                    ) {
                        const streamTime = moment(
                            streamData.data[0].started_at
                        ).isValid()
                            ? moment(streamData.data[0].started_at).toDate()
                            : null;

                        twitchEmbed.setFooter('Stream started');
                        if (streamTime) twitchEmbed.setTimestamp(streamTime);
                    }
                    if (twitchChannel) {
                        twitchChannel.send('', { embed: twitchEmbed });
                    }
                }
            } catch (err) {
                const channel = client.channels.get(
                    process.env.ISSUE_LOG_CHANNEL_ID
                ) as TextChannel;

                channel.send(stripIndents`
                    <@${
                        client.owners[0].id
                    }> Error occurred in sending a twitch live notifier!
                    **Server:** ${curGuild.name} (${curGuild.id})
                    **Member:** ${curUser.tag} (${curUser.id})
                    **Time:** ${moment().format(
                        'MMMM Do YYYY [at] HH:mm:ss [UTC]Z'
                    )}
                    **Old Activity:** ${oldActivity.url}
                    **New Activity:** ${newActivity.url}
                    **Error Message:** ${err}
                `);
            }
        }
    }
};

export const handleRateLimit = (
    client: CommandoClient,
    info: RateLimitData
) => {
    const channel = client.channels.get(
        process.env.RATELIMIT_LOG_CHANNEL_ID
    ) as TextChannel;

    channel.send(stripIndents`
        Ran into a **rate limit**!
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Timeout**: ${info.timeout}
        **Limit**: ${info.limit}
        **HTTP Method**: ${info.method}
        **Path**: ${info.path}
        **Route**: ${info.route}
    `);
};

export const handleReady = (client: CommandoClient) => {
    /* tslint:disable-next-line:no-console */
    console.log(oneLine`Client ready at ${moment().format('HH:mm:ss')};
        logged in as ${client.user.username}#${client.user.discriminator} (${
        client.user.id
    })`);
    const bot = client;

    setInterval(() => {
        forceStopTyping(bot);
        renderTimerMessage(bot);
        renderCountdownMessage(bot);
    }, ms('3m'));

    setInterval(() => {
        renderReminderMessage(bot);
    }, ms('5m'));

    setInterval(() => {
        renderLottoMessage(bot);
        forceEshopUpdate(bot);
    }, ms('24h'));

    fs.watch(
        path.join(__dirname, '../data/dex/formats.json'),
        (eventType, filename) => {
            if (filename) {
                decache(path.join(__dirname, '../data/dex/formats.json'));
                client.registry.resolveCommand('pokemon:dex').reload();
            }
        }
    );
};

export const handleRejection = (
    client: CommandoClient,
    reason: Error | any,
    p: Promise<any>
) => {
    const channel = client.channels.get(
        process.env.ISSUE_LOG_CHANNEL_ID
    ) as TextChannel;

    channel.send(stripIndents`
        Caught **Unhandled Rejection **!
        **At:** ${p}
        **Reason:** ${reason}
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    `);
};

export const handleUnknownCmd = (
    client: CommandoClient,
    msg: CommandoMessage
) => {
    const guild = msg.guild as CommandoGuild;

    if (guild && guild.settings.get('unknownmessages', true)) {
        msg.reply(stripIndents`${oneLine`That is not a registered command.
				Use \`${guild ? guild.commandPrefix : client.commandPrefix}help\`
				or ${client.user.tag} help to view the list of all commands.`}
				${oneLine`Server staff (those who can manage other's messages) can disable these replies by using
				\`${
                    guild ? guild.commandPrefix : client.commandPrefix
                }unknownmessages disable\``}`);
    }
};

export const handleWarn = (client: CommandoClient, warn: string) => {
    const channel = client.channels.get(
        process.env.ISSUE_LOG_CHANNEL_ID
    ) as TextChannel;

    channel.send(stripIndents`
        Caught **General Warning**!
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Warning Message:** ${warn}
    `);
};
