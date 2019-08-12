/* eslint-disable @typescript-eslint/no-for-in-array, no-console */
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoGuild, CommandoMessage } from 'awesome-commando';
import { DMChannel, GuildChannel, GuildMember, MessageAttachment, MessageEmbed, RateLimitData, Snowflake, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import fs from 'fs';
import interval from 'interval-promise';
import jimp from 'jimp';
import moment from 'moment';
import fetch from 'node-fetch';
import path from 'path';
import { badwords, caps, duptext, emojis, invites, links, mentions, slowmode } from './AutomodHelper';
import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from './Constants';
import { decache } from './Decache';
import {
  getChannelsData, getCommandsData, getMessagesData,
  getServersData, getUsersData, setChannelsData,
  setCommandsData, setMessagesData, setServersData,
  setUptimeData, setUsersData
} from './FirebaseActions';
import FirebaseStorage from './FirebaseStorage';
import { parseOrdinal, prod } from './Utils';
import {
  readAllReminders, deleteReminder, readAllCountdowns,
  writeCountdown, deleteCountdown, deleteCasino,
  readCasinoTimeout, updateCasinoTimeout, readAllCasinoForGuild,
  writeCasino, readAllTimers, writeTimer, readAllCasinoGuildIds, createCasinoTimeout
} from './Typeorm/DbInteractions';

const sendReminderMessages = async (client: CommandoClient) => {
  try {
    const reminders = await readAllReminders();

    for (const reminder of reminders) {
      const remindTime = moment(reminder.date);
      const dura = moment.duration(remindTime.diff(moment()));

      if (dura.asMinutes() <= 0) {
        const user = await client.users.fetch(reminder.userId!);

        user.send({
          embed: {
            author: {
              iconURL: client.user.displayAvatarURL({ format: 'png' }),
              name: 'Ribbon Reminders',
            },
            color: 10610610,
            description: reminder.content,
            thumbnail: {
              url:
                `${ASSET_BASE_PATH}/ribbon/reminders.png`,
            },
          },
        });

        await deleteReminder(reminder.id);
      }
    }
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> Error occurred sending someone their reminder!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

const sendCountdownMessages = async (client: CommandoClient) => {
  try {
    const countdowns = await readAllCountdowns();

    for (const countdown of countdowns) {
      const cdMoment = moment(countdown.lastsend).add(24, 'hours');
      const dura = moment.duration(cdMoment.diff(moment()));

      if (dura.asMinutes() <= 0) {
        const guild = client.guilds.get(countdown.guildId!);
        if (!guild) continue;
        const channel = guild.channels.get(countdown.channelId!) as TextChannel;
        const me = guild.me;
        const countdownEmbed = new MessageEmbed()
          .setAuthor('Countdown Reminder', me.user.displayAvatarURL({ format: 'png' }))
          .setColor(me.displayHexColor)
          .setTimestamp()
          .setDescription(stripIndents`
            Event on: ${moment(countdown.datetime).format('MMMM Do YYYY [at] HH:mm')}
            That is:
            ${moment.duration(moment(countdown.datetime).diff(moment(), 'days'), 'days').format('w [weeks][, ] d [days] [and] h [hours]')}

            **__${countdown.content}__**`
          );

        if (moment(countdown.datetime).diff(new Date(), 'hours') >= 24) {
          await writeCountdown({
            name: countdown.name,
            guildId: countdown.guildId,
            lastsend: new Date(),
          });
        }
        await deleteCountdown(countdown.name, countdown.guildId);

        switch (countdown.tag) {
          case 'everyone':
            channel.send('@everyone GET HYPE IT IS TIME!', countdownEmbed);
            break;
          case 'here':
            channel.send('@here GET HYPE IT IS TIME!', countdownEmbed);
            break;
          default:
            channel.send('GET HYPE IT IS TIME!', countdownEmbed);
            break;
        }
      }
    }
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> Error occurred sending a countdown!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

const setUpdateToFirebase = async (client: CommandoClient) => {
  try {
    const uptime = moment.duration(process.uptime() * 1000).format('D [days], H [hours] [and] m [minutes]');
    setUptimeData(uptime);
  } catch (err) {
    const logChannel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    logChannel.send(stripIndents`
      <@${client.owners[0].id}> Failed to update Firebase uptime data!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

const sendJoinMessage = async (member: GuildMember) => {
  try {
    const avatar = await jimp.read(member.user.displayAvatarURL({ format: 'png' }));
    const border = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/border.png`);
    const canvas = await jimp.read(500, 150);
    const newMemberEmbed = new MessageEmbed();
    const fontLarge = await jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-large.fnt'));
    const fontMedium = await jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-medium.fnt'));
    const mask = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/mask.png`);

    avatar.resize(136, jimp.AUTO);
    mask.resize(136, jimp.AUTO);
    border.resize(136, jimp.AUTO);
    avatar.mask(mask, 0, 0);
    avatar.composite(border, 0, 0);
    canvas.blit(avatar, 5, 5);
    canvas.print(fontLarge, 155, 10, 'welcome'.toUpperCase());
    canvas.print(fontMedium, 160, 60, `you are the ${parseOrdinal(member.guild.memberCount)} member`.toUpperCase());
    canvas.print(fontMedium, 160, 80, `of ${member.guild.name}`.toUpperCase());

    const buffer = await canvas.getBufferAsync(jimp.MIME_PNG);
    const embedAttachment = new MessageAttachment(buffer, 'joinimg.png');

    newMemberEmbed
      .attachFiles([ embedAttachment ])
      .setColor('#80F31F')
      .setTitle('NEW MEMBER!')
      .setDescription(`Please give a warm welcome to __**${member.displayName}**__  (\`${member.id}\`)`)
      .setImage('attachment://joinimg.png');

    const guild = member.guild as CommandoGuild;
    const channel = member.guild.channels.get(guild.settings.get('joinmsgchannel')) as TextChannel;

    return channel.send(`Welcome <@${member.id}> 🎗️!`, { embed: newMemberEmbed });
  } catch (err) {
    return null;
  }
};

const sendLeaveMessage = async (member: GuildMember) => {
  try {
    const avatar = await jimp.read(member.user.displayAvatarURL({ format: 'png' }));
    const border = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/border.png`);
    const canvas = await jimp.read(500, 150);
    const leaveMemberEmbed = new MessageEmbed();
    const fontMedium = await jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-medium.fnt'));
    const fontLarge = await jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-large.fnt'));
    const mask = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/mask.png`);

    avatar.resize(136, jimp.AUTO);
    mask.resize(136, jimp.AUTO);
    border.resize(136, jimp.AUTO);
    avatar.mask(mask, 0, 0);
    avatar.composite(border, 0, 0);
    canvas.blit(avatar, 5, 5);
    canvas.print(fontLarge, 155, 10, 'goodbye'.toUpperCase());
    canvas.print(fontMedium, 160, 60, `there are now ${member.guild.memberCount} members`.toUpperCase());
    canvas.print(fontMedium, 160, 80, `on ${member.guild.name}`.toUpperCase());

    const buffer = await canvas.getBufferAsync(jimp.MIME_PNG);
    const embedAttachment = new MessageAttachment(buffer, 'leaveimg.png');

    leaveMemberEmbed
      .attachFiles([ embedAttachment ])
      .setColor('#F4BF42')
      .setTitle('Member Left 😢')
      .setDescription(`You will be missed __**${member.displayName}**__ (\`${member.id}\`)`)
      .setImage('attachment://leaveimg.png');

    const guild = member.guild as CommandoGuild;
    const channel = member.guild.channels.get(guild.settings.get('leavemsgchannel')) as TextChannel;

    return channel.send('', { embed: leaveMemberEmbed });
  } catch (err) {
    return null;
  }
};

const payoutLotto = async (client: CommandoClient) => {
  try {
    const casinoData = await readAllCasinoGuildIds();

    for (const casino of casinoData) {
      const guildId = casino.guildId!;

      if (client.guilds.get(guildId)) {
        const lastCheck = await readCasinoTimeout(guildId);

        if (lastCheck && lastCheck.timeout) {
          const diff = moment.duration(moment(lastCheck.timeout).add(1, 'days').diff(moment()));
          const diffInDays = diff.asDays();
          if (diffInDays >= 0) continue;
        } else {
          await createCasinoTimeout({
            guildId,
            timeout: new Date(),
          });
        }

        const casinoGuildEntries = await readAllCasinoForGuild(guildId);
        const winner = Math.floor(Math.random() * casinoGuildEntries.length);

        if (!casinoGuildEntries[winner]) throw new Error('no_rows');
        const previousBalance = casinoGuildEntries[winner].balance!;
        const newBalance = previousBalance + 2000;

        await writeCasino({
          userId: casinoGuildEntries[winner].userId,
          guildId,
          balance: newBalance,
        });

        await updateCasinoTimeout({
          guildId,
          timeout: new Date(),
        });

        const defaultChannel = client.guilds.get(guildId)!.systemChannel;
        const winnerEmbed = new MessageEmbed();
        const winnerMember: GuildMember = client.guilds.get(guildId)!.members.get(casinoGuildEntries[winner].userId!)!;
        if (!winnerMember) continue;
        const winnerLastMessageChannelId: Snowflake | null = winnerMember.lastMessageChannelID;
        const winnerLastMessageChannel = winnerLastMessageChannelId ?
          client.guilds.get(guildId)!.channels.get(winnerLastMessageChannelId)! :
          null;
        const winnerLastMessageChannelPermitted: boolean = winnerLastMessageChannel ?
          winnerLastMessageChannel.permissionsFor(client.user)!.has('SEND_MESSAGES') :
          false;

        winnerEmbed
          .setColor(DEFAULT_EMBED_COLOR)
          .setDescription(`Congratulations <@${casinoGuildEntries[winner].userId}>! You won today's random lotto and were granted 2000 chips 🎉!`)
          .setAuthor(winnerMember.displayName, winnerMember.user.displayAvatarURL({ format: 'png' }))
          .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`)
          .addField('Balance', `${previousBalance} ➡ ${newBalance}`);

        if (winnerLastMessageChannelPermitted && winnerLastMessageChannel) {
          (winnerLastMessageChannel as TextChannel).send(`<@${casinoGuildEntries[winner].userId}>`, { embed: winnerEmbed });
        } else if (defaultChannel) {
          defaultChannel.send(`<@${casinoGuildEntries[winner].userId}>`, { embed: winnerEmbed });
        }
      }
    }
  } catch (err) {
    if (!/(?:no_rows)/i.test(err.toString())) {
      const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${client.owners[0].id}> Error occurred giving someone their lotto payout!
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`
      );
    }
  }
};

const sendTimedMessages = async (client: CommandoClient) => {
  try {
    const timers = await readAllTimers();

    for (const timer of timers) {
      const timerMoment = moment(timer.lastsend).add(timer.interval, 'ms');
      const dura = moment.duration(timerMoment.diff(moment()));

      if (dura.asMinutes() <= 0) {
        await writeTimer({
          name: timer.name,
          guildId: timer.guildId,
          lastsend: new Date(),
        });
        const guild = client.guilds.get(timer.guildId!);
        if (!guild) continue;
        const channel = guild.channels.get(timer.channelId!) as TextChannel;
        const me = guild.me;
        const memberMentions = timer.members ? timer.members.map(member => `<@${member}>`).join(' ') : null;
        const timerEmbed = new MessageEmbed()
          .setAuthor(`${client.user.username} Timed Message`, me.user.displayAvatarURL({ format: 'png' }))
          .setColor(me.displayHexColor)
          .setDescription(timer.content)
          .setTimestamp();

        channel.send(memberMentions ? memberMentions : '', timerEmbed);
      }
    }
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> Error occurred sending a timed message!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

export const handleCmdErr = (client: CommandoClient, cmd: Command, err: Error, msg: CommandoMessage) => {
  const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

  channel.send(stripIndents`
    Caught **Command Error**!
    **Command:** ${cmd.name}
    ${msg.guild ? `**Server:** ${msg.guild.name} (${msg.guild.id})` : null}
    **Author:** ${msg.author.tag} (${msg.author.id})
    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    **Error Message:** ${err.message}`);
};

export const handleCommandRun = (client: CommandoClient, cmd: Command, msg: CommandoMessage) => {
  try {
    if (cmd.group.id === 'owner') return;

    let commandsCount = FirebaseStorage.commands;
    commandsCount++;

    FirebaseStorage.commands = commandsCount;
    setCommandsData(String(commandsCount));
  } catch (err) {
    const logChannel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    logChannel.send(stripIndents`
      <@${client.owners[0].id}> Failed to update Firebase commands count!
      **Message ID:** (${msg.id})
      **Channel Data:** ${(msg.channel as TextChannel).name} (${msg.channel.id})
      **Guild Data:** ${msg.guild.name} (${msg.guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

export const handleChannelCreate = (client: CommandoClient, channel: DMChannel | GuildChannel) => {
  if (channel.type === 'category' || channel.type === 'dm') return;

  try {
    let channelsCount = FirebaseStorage.channels;
    channelsCount++;

    FirebaseStorage.channels = channelsCount;
    setChannelsData(channelsCount.toString());
  } catch (err) {
    const logChannel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    logChannel.send(stripIndents`
      <@${client.owners[0].id}> Failed to update Firebase messages count!
      **Channel Data:** ${(channel as TextChannel).name} (${channel.id})
      **Guild Data:** ${(channel as GuildChannel).guild.name} (${(channel as GuildChannel).guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

export const handleChannelDelete = (client: CommandoClient, channel: DMChannel | GuildChannel) => {
  if (channel.type === 'category' || channel.type === 'dm') return;

  try {
    let channelsCount = FirebaseStorage.channels;
    channelsCount--;

    FirebaseStorage.channels = channelsCount;
    setChannelsData(channelsCount.toString());
  } catch (err) {
    const logChannel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    logChannel.send(stripIndents`
      <@${client.owners[0].id}> Failed to update Firebase messages count!
      **Channel Data:** ${(channel as TextChannel).name} (${channel.id})
      **Guild Data:** ${(channel as GuildChannel).guild.name} (${(channel as GuildChannel).guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

export const handleDebug = (info: string): void => {
  if (!prod) {
    return console.info(info);
  }

  return undefined;
};

export const handleErr = async (client: CommandoClient, err: Error) => {
  if (prod) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    return channel.send(stripIndents`
      Caught **WebSocket Error**!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err.message}`
    );
  }

  return console.error(stripIndents`
    Caught **WebSocket Error**!
    **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    **Error Message:** ${err.message}`
  );
};

export const handleGuildJoin = async (client: CommandoClient, guild: CommandoGuild): Promise<void> => {
  try {
    const avatar = await jimp.read(client.user.displayAvatarURL({ format: 'png' }));
    const border = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/border.png`);
    const canvas = await jimp.read(500, 150);
    const mask = await jimp.read(`${ASSET_BASE_PATH}/ribbon/jimp/mask.png`);
    const fontMedium = await jimp.loadFont(path.join(__dirname, '../data/fonts/roboto-medium.fnt'));
    const newGuildEmbed = new MessageEmbed();
    const channel = guild.systemChannel ? guild.systemChannel : null;

    avatar.resize(136, jimp.AUTO);
    mask.resize(136, jimp.AUTO);
    border.resize(136, jimp.AUTO);
    avatar.mask(mask, 0, 0);
    avatar.composite(border, 0, 0);
    canvas.blit(avatar, 5, 5);
    canvas.print(fontMedium, 155, 55, `Currently powering up ${client.guilds.size} servers`.toUpperCase());
    canvas.print(fontMedium, 155, 75, `serving ${client.users.size} Discord users`.toUpperCase());

    const buffer = await canvas.getBufferAsync(jimp.MIME_PNG);
    const embedAttachment = new MessageAttachment(buffer, 'added.png');

    newGuildEmbed
      .attachFiles([ embedAttachment ])
      .setColor('#80F31F')
      .setTitle('Ribbon is here!')
      .setDescription(stripIndents`
        I'm an all-purpose bot and I hope I can make your server better!
        I've got many commands, you can see them all by using \`${client.commandPrefix}help\`
        Don't like the prefix? The admins can change my prefix by using \`${client.commandPrefix}prefix [new prefix]\`

        **All these commands can also be called by mentioning me instead of using a prefix, for example \`@${client.user.tag} help\`**`
      )
      .setImage('attachment://added.png');

    if (channel) channel.send('', { embed: newGuildEmbed });
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> Failed to say welcome upon joining ${guild.name} (${guild.id})!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }

  try {
    let serverCount = FirebaseStorage.servers;
    serverCount++;

    FirebaseStorage.servers = serverCount;
    setServersData(serverCount.toString());
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> Failed to update Firebase servers count when joining ${guild.name} (${guild.id})!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

export const handleGuildLeave = (client: CommandoClient, guild: CommandoGuild): void => {
  guild.settings.clear();

  try {
    let serverCount = FirebaseStorage.servers;
    serverCount--;

    FirebaseStorage.servers = serverCount;
    setServersData(serverCount.toString());
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> Failed to update Firebase servers count when leaving ${guild.name} (${guild.id})!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

export const handleMemberJoin = (client: CommandoClient, member: GuildMember) => {
  const memberJoinLogEmbed = new MessageEmbed();
  const guild = member.guild as CommandoGuild;

  try {
    if (guild.settings.get('defaultRole') && guild.roles.get(guild.settings.get('defaultRole')) && member.manageable) {
      member.roles.add(guild.settings.get('defaultRole'));
      memberJoinLogEmbed.setDescription(`Automatically assigned the role ${member.guild.roles.get(guild.settings.get('defaultRole'))!.name} to this member`);
    }
    // eslint-disable-next-line no-empty
  } catch { }

  try {
    if (guild.settings.get('memberlogs', true)) {
      const memberLogs = guild.settings.get('memberlogchannel',
        member.guild.channels.find(channel => channel.name === 'member-logs') ?
          member.guild.channels.find(channel => channel.name === 'member-logs')!.id :
          null);

      memberJoinLogEmbed
        .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL({ format: 'png' }))
        .setFooter('User joined')
        .setTimestamp()
        .setColor('#80F31F');

      if (memberLogs &&
        member.guild.channels.get(memberLogs) &&
        member.guild.channels.get(memberLogs)!.permissionsFor(client.user)!.has('SEND_MESSAGES')) {
        const channel = guild.channels.get(memberLogs) as TextChannel;

        channel.send('', { embed: memberJoinLogEmbed });
      }
    }
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> An error sending the member join memberlog message!
      **Server:** ${member.guild.name} (${member.guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }

  try {
    if (
      guild.settings.get('joinmsgs', false) &&
      guild.settings.get('joinmsgchannel', null)
    ) {
      sendJoinMessage(member);
    }
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> An error occurred sending the member join image!
      **Server:** ${member.guild.name} (${member.guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }

  try {
    let usersCount = FirebaseStorage.users;
    usersCount++;

    FirebaseStorage.users = usersCount;
    setUsersData(usersCount.toString());
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> Failed to update Firebase messages count!
      **Member ID:** (${member.id})
      **Guild Data:** ${guild.name} (${guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

export const handleMemberLeave = (client: CommandoClient, member: GuildMember): void => {
  const guild = member.guild as CommandoGuild;

  try {
    if (guild.settings.get('memberlogs', true)) {
      const memberLeaveLogEmbed = new MessageEmbed();
      const memberLogs = guild.settings.get('memberlogchannel',
        member.guild.channels.find(channel => channel.name === 'member-logs') ?
          member.guild.channels.find(channel => channel.name === 'member-logs')!.id :
          null);

      memberLeaveLogEmbed
        .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL({ format: 'png' }))
        .setFooter('User left')
        .setTimestamp()
        .setColor('#F4BF42');

      if (memberLogs &&
        member.guild.channels.get(memberLogs) &&
        member.guild.channels.get(memberLogs)!.permissionsFor(client.user)!.has('SEND_MESSAGES')) {
        const channel = guild.channels.get(memberLogs) as TextChannel;

        channel.send('', { embed: memberLeaveLogEmbed });
      }
    }
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> An error occurred sending the member left memberlog message!
      **Server:** ${member.guild.name} (${member.guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }

  try {
    deleteCasino(member.id, guild.id);
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> An error occurred removing ${member.user.tag} (${member.id}) casino data when they left the server!
      **Server:** ${member.guild.name} (${member.guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }

  try {
    if (guild.settings.get('leavemsgs', false) && guild.settings.get('leavemsgchannel', null)) {
      sendLeaveMessage(member);
    }
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> An error occurred sending the member leave image!
      **Server:** ${member.guild.name} (${member.guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }

  try {
    let usersCount = FirebaseStorage.users;
    usersCount--;

    FirebaseStorage.users = usersCount;
    setUsersData(usersCount.toString());
  } catch (err) {
    const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

    channel.send(stripIndents`
      <@${client.owners[0].id}> Failed to update Firebase messages count!
      **Member ID:** (${member.id})
      **Guild Data:** ${guild.name} (${guild.id})
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}`
    );
  }
};

export const handleMsg = (client: CommandoClient, msg: CommandoMessage): void => {
  const guild = msg.guild;

  if (msg.guild && msg.deletable && guild.settings.get('automod', false).enabled) {
    if (msg.member.roles.some(role => guild.settings.get('automod', []).filterroles.includes(role.id))) {
      return;
    }
    if (guild.settings.get('caps', false).enabled) {
      const opts = guild.settings.get('caps');

      if (caps(msg, opts.threshold, opts.minlength, client)) msg.delete();
    }
    if (guild.settings.get('duptext', false).enabled) {
      const opts = guild.settings.get('duptext');

      if (duptext(
        msg, opts.within, opts.equals, opts.distance, client
      )) {
        msg.delete();
      }
    }
    if (guild.settings.get('emojis', false).enabled) {
      const opts = guild.settings.get('emojis');

      if (emojis(msg, opts.threshold, opts.minlength, client)) {
        msg.delete();
      }
    }
    if (guild.settings.get('badwords', false).enabled && badwords(msg, guild.settings.get('badwords').words, client)) {
      msg.delete();
    }
    if (guild.settings.get('invites', false) && invites(msg, client)) {
      msg.delete();
    }
    if (guild.settings.get('links', false) && links(msg, client)) {
      msg.delete();
    }
    if (guild.settings.get('mentions', false).enabled && mentions(msg, guild.settings.get('mentions').threshold, client)) {
      msg.delete();
    }
    if (guild.settings.get('slowmode', false).enabled && slowmode(msg, guild.settings.get('slowmode').within, client)) {
      msg.delete();
    }
  }

  if (msg.author.id === client.user.id) {
    try {
      let messagesCount = FirebaseStorage.messages;
      messagesCount++;

      FirebaseStorage.messages = messagesCount;
      setMessagesData(String(messagesCount));
    } catch (err) {
      const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${client.owners[0].id}> Failed to update Firebase messages count!
        **Message ID:** (${msg.id})
        **Channel Data:** ${(msg.channel as TextChannel).name} (${msg.channel.id})
        **Guild Data:** ${msg.guild.name} (${msg.guild.id})
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`
      );
    }
  }
};

export const handlePresenceUpdate = async (client: CommandoClient, oldMember: GuildMember, newMember: GuildMember) => {
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
              largeImageURL: () => '',
              largeText: '',
              smallImage: '',
              smallImageURL: () => '',
              smallText: '',
            },
            details: '',
            equals: () => false,
            name: '',
            party: { id: '', size: [ 0, 0 ] },
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
              largeImageURL: () => '',
              largeText: '',
              smallImage: '',
              smallImageURL: () => '',
              smallText: '',
            },
            details: '',
            equals: () => false,
            name: '',
            party: { id: '', size: [ 0, 0 ] },
            state: '',
            timestamps: { start: new Date(), end: new Date() },
            type: 'STREAMING',
            url: 'placeholder',
          };
        }
        if (!/(twitch)/i.test(oldActivity.url) && /(twitch)/i.test(newActivity.url)) {
          const userFetch = await fetch(`https://api.twitch.tv/helix/users?${stringify({ login: newActivity.url.split('/')[3] })}`,
            { headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID! } });
          const userData = await userFetch.json();
          const streamFetch = await fetch(`https://api.twitch.tv/helix/streams?${stringify({ channel: userData.data[0].id })}`,
            { headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID! } });
          const streamData = await streamFetch.json();
          const twitchChannelID = curGuild.settings.get('twitchchannelID', null);
          const twitchChannel = twitchChannelID ?
            (curGuild.channels.get(twitchChannelID) as TextChannel) :
            null;
          const twitchEmbed = new MessageEmbed();

          twitchEmbed
            .setThumbnail(curUser.displayAvatarURL())
            .setURL(newActivity.url)
            .setColor('#6441A4')
            .setTitle(`${curDisplayName} just went live!`)
            .setDescription(stripIndents`
              streaming \`${newActivity.details}\`!\n\n**Title:**\n${newActivity.name}`);

          if (userFetch.ok && userData.data.length > 0 && userData.data[0]) {
            twitchEmbed
              .setThumbnail(userData.data[0].profile_image_url)
              .setTitle(`${userData.data[0].display_name} just went live!`)
              .setDescription(stripIndents`
                ${userData.data[0].display_name} just started ${twitchEmbed.description}`)
              .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${userData.data[0].login}-1920x1080.jpg`);
          }

          if (streamFetch.ok && streamData.data.length > 0 && streamData.data[0]) {
            const streamTime = moment(streamData.data[0].started_at).isValid() ?
              moment(streamData.data[0].started_at).toDate() :
              null;

            twitchEmbed.setFooter('Stream started');
            if (streamTime) twitchEmbed.setTimestamp(streamTime);
          }
          if (twitchChannel) {
            twitchChannel.send('', { embed: twitchEmbed });
          }
        }
      } catch (err) {
        const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

        channel.send(stripIndents`
          <@${client.owners[0].id}> Error occurred in sending a twitch live notifier!
          **Server:** ${curGuild.name} (${curGuild.id})
          **Member:** ${curUser.tag} (${curUser.id})
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Old Activity:** ${oldActivity.url}
          **New Activity:** ${newActivity.url}
          **Error Message:** ${err}`
        );
      }
    }
  }
};

export const handleRateLimit = async (client: CommandoClient, info: RateLimitData) => {
  if (prod) {
    const channel = client.channels.get(process.env.RATELIMIT_LOG_CHANNEL_ID!) as TextChannel;

    return channel.send(stripIndents`
      Ran into a **rate limit**!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Timeout**: ${info.timeout}
      **Limit**: ${info.limit}
      **HTTP Method**: ${info.method}
      **Path**: ${info.path}
      **Route**: ${info.route}`
    );
  }

  return undefined;
};

export const handleReady = async (client: CommandoClient) => {
  FirebaseStorage.channels = parseInt(await getChannelsData());
  FirebaseStorage.commands = parseInt(await getCommandsData());
  FirebaseStorage.messages = parseInt(await getMessagesData());
  FirebaseStorage.servers = parseInt(await getServersData());
  FirebaseStorage.users = parseInt(await getUsersData());

  if (prod) {
    const everyMinute = 1 * 60 * 1000;
    const everyThreeMinutes = 3 * 60 * 1000;
    const everyThirdHour = 3 * 60 * 60 * 1000;

    interval(async () => setUpdateToFirebase(client), everyThreeMinutes);
    interval(async () => sendTimedMessages(client), everyMinute);
    interval(async () => sendCountdownMessages(client), everyThreeMinutes);
    interval(async () => sendReminderMessages(client), everyMinute);
    interval(async () => payoutLotto(client), everyThirdHour);
  }

  fs.watch(path.join(__dirname, '../data/dex/formats.json'),
    (eventType, filename) => {
      if (filename) {
        decache(path.join(__dirname, '../data/dex/formats.json'));
        client.registry.resolveCommand('pokemon:dex').reload();
      }
    });

  console.info(oneLine`
    Client ready at ${moment().format('HH:mm:ss')};
    logged in as ${client.user.tag} (${client.user.id})`
  );
};

export const handleRejection = (reason: Error | unknown, promise: Promise<unknown>) => {
  if (reason instanceof Error) reason = reason.message;

  console.error(stripIndents`
    Caught **Unhandled Rejection **!
    **At:** ${promise}
    **Reason:** ${reason}
    **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`
  );
};

export const handleWarn = async (client: CommandoClient, warn: string) => {
  const channel = client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

  if (channel) {
    return channel.send(stripIndents`
      Caught **General Warning**!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Warning Message:** ${warn}`
    );
  }

  return console.warn(warn);
};

export const handleShardDisconnect = (event: CloseEvent, shard: number) => {
  if (prod) {
    return console.error(stripIndents`
      >>>>>>
          Shard Disconnected, warning, it will not reconnect!
          **Shard Number:** ${shard}
          **Close Event Code:** ${event.code}
          **Close Event Reason:** ${event.reason}
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      <<<<<<`
    );
  }

  return undefined;
};

export const handleShardError = (event: Error, shard: number) => {
  if (prod) {
    return console.error(stripIndents`
      >>>>>>
          Shard encountered a connection error!
          **Shard Number:** ${shard}
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
          **Error Message:** ${event.message}
      <<<<<<`
    );
  }

  return undefined;
};

export const handleShardReady = (shard: number) => {
  if (prod) {
    console.info(stripIndents`
      >>>>>>
          New Shard is ready!
          Shard Number: ${shard}
          Time: ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      <<<<<<`
    );
  }

  return undefined;
};

export const handleShardReconnecting = (shard: number) => {
  if (prod) {
    console.info(stripIndents`
      >>>>>>
          Shard is reconnecting!
          **Shard Number:** ${shard}
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      <<<<<<`
    );
  }

  return undefined;
};

export const handleShardResumed = (shard: number, replayedEvents: number) => {
  if (prod) {
    console.info(stripIndents`
      >>>>>>
          Shard is resumed successfully!
          **Shard Number:** ${shard}
          **Amount of replayed events:** ${replayedEvents}
          **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      <<<<<<`
    );
  }

  return undefined;
};