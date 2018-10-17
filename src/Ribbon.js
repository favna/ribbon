const Database = require('better-sqlite3'),
  decache = require('decache'),
  fetch = require('node-fetch'),
  fs = require('fs'),
  moment = require('moment'),
  ms = require('ms'),
  path = require('path'),
  querystring = require('querystring'),
  {Client, SyncSQLiteProvider} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {badwords, duptext, caps, emojis, mentions, links, invites, slowmode} = require(path.join(__dirname, 'components/automod.js')),
  {checkReminders, countdownMessages, fetchEshop, forceStopTyping, guildAdd, guildLeave, joinMessage, leaveMessage, lotto, timerMessages} = require(path.join(__dirname, 'components/events.js'));

class Ribbon {
  constructor (token) {
    this.token = token;
    this.client = new Client({
      commandPrefix: '!',
      owner: ['112001393140723712', '268792781713965056'],
      unknownCommandResponse: false,
      presence: {
        status: 'online',
        activity: {
          application: '376520643862331396',
          name: '@Ribbon help',
          type: 'WATCHING',
          details: 'Made by Favna',
          state: 'https://favna.xyz/ribbon',
          assets: {
            largeImage: '385133227997921280',
            smallImage: '385133144245927946',
            largeText: 'Invite me to your server!',
            smallText: 'https://favna.xyz/redirect/ribbon'
          }
        }
      }
    });
  }

  onCmdErr () {
    return (cmd, err, msg) => {
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      Caught **Command Error**!
      **Command:** ${cmd.name}
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
    };
  }

  onErr () {
    return (err) => {
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      Caught **WebSocket Error**!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
    };
  }

  onGuildJoin () {
    return (guild) => {
      guildAdd(this.client, guild);
    };
  }

  onGuildLeave () {
    return (guild) => {
      guildLeave(this.client, guild);
    };
  }

  onGuildMemberAdd () {
    return (member) => {
      const joinmember = member;

      try {
        if (joinmember.guild.settings.get('memberlogs', true)) {
          const memberJoinLogEmbed = new MessageEmbed(),
            memberLogs = joinmember.guild.settings.get('memberlogchannel',
              joinmember.guild.channels.find(c => c.name === 'member-logs') ? joinmember.guild.channels.find(c => c.name === 'member-logs').id : null);

          memberJoinLogEmbed.setAuthor(`${joinmember.user.tag} (${joinmember.id})`, joinmember.user.displayAvatarURL({format: 'png'}))
            .setFooter('User joined')
            .setTimestamp()
            .setColor('#80F31F');

          if (joinmember.guild.settings.get('defaultRole') && joinmember.guild.roles.get(joinmember.guild.settings.get('defaultRole'))) {

            joinmember.roles.add(joinmember.guild.settings.get('defaultRole'));
            memberJoinLogEmbed.setDescription(`Automatically assigned the role ${joinmember.guild.roles.get(joinmember.guild.settings.get('defaultRole')).name} to this member`);
          }

          if (memberLogs && joinmember.guild.channels.get(memberLogs) && joinmember.guild.channels.get(memberLogs).permissionsFor(this.client.user)
            .has('SEND_MESSAGES')) {
            joinmember.guild.channels.get(memberLogs).send('', {embed: memberJoinLogEmbed});
          }
        }
      } catch (err) {
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> An error sending the member join memberlog message!
        **Server:** ${joinmember.guild.name} (${joinmember.guild.id})
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}
        `);
      }

      try {
        if (joinmember.guild.settings.get('joinmsgs', false) && joinmember.guild.settings.get('joinmsgchannel', null)) {
          joinMessage(joinmember);
        }
      } catch (err) {
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> An error occurred sending the member join image!
        **Server:** ${joinmember.guild.name} (${joinmember.guild.id})
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}
        `);
      }
    };
  }

  onGuildMemberRemove () {
    return (member) => {
      const leavemember = member;

      try {
        if (leavemember.guild.settings.get('memberlogs', true)) {
          const memberLeaveLogEmbed = new MessageEmbed(),
            memberLogs = leavemember.guild.settings.get('memberlogchannel',
              leavemember.guild.channels.find(c => c.name === 'member-logs') ? leavemember.guild.channels.find(c => c.name === 'member-logs').id : null);

          memberLeaveLogEmbed.setAuthor(`${leavemember.user.tag} (${leavemember.id})`, leavemember.user.displayAvatarURL({format: 'png'}))
            .setFooter('User left')
            .setTimestamp()
            .setColor('#F4BF42');

          if (memberLogs && leavemember.guild.channels.get(memberLogs) && leavemember.guild.channels.get(memberLogs).permissionsFor(this.client.user)
            .has('SEND_MESSAGES')) {
            leavemember.guild.channels.get(memberLogs).send('', {embed: memberLeaveLogEmbed});
          }
        }

      } catch (err) {
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> An error occurred sending the member left memberlog message!
        **Server:** ${leavemember.guild.name} (${leavemember.guild.id})
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}
        `);
      }

      try {
        const conn = new Database(path.join(__dirname, 'data/databases/casino.sqlite3')),
          query = conn.prepare(`SELECT * FROM "${leavemember.guild.id}" WHERE userID = ?`).get(leavemember.id);

        if (query) {
          conn.prepare(`DELETE FROM "${leavemember.guild.id}" WHERE userID = ?`).run(leavemember.id);
        }
      } catch (err) {
        null;
      }

      try {
        if (leavemember.guild.settings.get('leavemsgs', false) && leavemember.guild.settings.get('leavemsgchannel', null)) {
          leaveMessage(leavemember);
        }
      } catch (err) {
        this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
        <@${this.client.owners[0].id}> An error occurred sending the member leave image!
        **Server:** ${leavemember.guild.name} (${leavemember.guild.id})
        **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}
        `);
      }
    };
  }

  onMessage () {
    // eslint-disable-next-line complexity, consistent-return
    return (msg) => {
      if (msg.guild && msg.deletable && msg.guild.settings.get('automod', false).enabled) {
        if (msg.member.roles.some(ro => msg.guild.settings.get('automod', []).filterroles.includes(ro.id))) return null;
        if (msg.guild.settings.get('caps', false).enabled) {
          const opts = msg.guild.settings.get('caps');

          if (caps(msg, opts.threshold, opts.minlength, this.client)) msg.delete();
        }
        if (msg.guild.settings.get('duptext', false).enabled) {
          const opts = msg.guild.settings.get('duptext');

          if (duptext(msg, opts.within, opts.equals, opts.distance, this.client)) msg.delete();
        }
        if (msg.guild.settings.get('emojis', false).enabled) {
          const opts = msg.guild.settings.get('emojis');

          if (emojis(msg, opts.threshold, opts.minlength, this.client)) msg.delete();
        }
        if (msg.guild.settings.get('badwords', false).enabled && badwords(msg, msg.guild.settings.get('badwords').words, this.client)) msg.delete();
        if (msg.guild.settings.get('invites', false) && invites(msg, this.client)) msg.delete();
        if (msg.guild.settings.get('links', false) && links(msg, this.client)) msg.delete();
        if (msg.guild.settings.get('mentions', false).enabled && mentions(msg, msg.guild.settings.get('mentions').threshold, this.client)) msg.delete();
        if (msg.guild.settings.get('slowmode', false).enabled && slowmode(msg, msg.guild.settings.get('slowmode').within, this.client)) msg.delete();
      }
    };
  }

  onPresenceUpdate () {
    return async (oldMember, newMember) => {
      if (newMember.guild.settings.get('twitchnotifiers', false)) {
        if (newMember.guild.settings.get('twitchmonitors', []).includes(newMember.id)) {
          const curDisplayName = newMember.displayName,
            curGuild = newMember.guild,
            curUser = newMember.user;
          let newActivity = newMember.presence.activity,
            oldActivity = oldMember.presence.activity;

          try {
            if (!oldActivity) {
              oldActivity = {url: 'placeholder'};
            }
            if (!newActivity) {
              newActivity = {url: 'placeholder'};
            }
            if (!(/(twitch)/i).test(oldActivity.url) && (/(twitch)/i).test(newActivity.url)) {
              const userFetch = await fetch(`https://api.twitch.tv/helix/users?${querystring.stringify({login: newActivity.url.split('/')[3]})}`, {headers: {'Client-ID': process.env.twitchclientid}}),
                userData = await userFetch.json(),
                streamFetch = await fetch(`https://api.twitch.tv/helix/streams?${querystring.stringify({channel: userData.data[0].id})}`, {headers: {'Client-ID': process.env.twitchclientid}}),
                streamData = await streamFetch.json(),
                twitchChannel = curGuild.settings.get('twitchchannel', null),
                twitchEmbed = new MessageEmbed();

              twitchEmbed
                .setThumbnail(curUser.displayAvatarURL())
                .setURL(newActivity.url)
                .setColor('#6441A4')
                .setTitle(`${curDisplayName} just went live!`)
                .setDescription(stripIndents`streaming \`${newActivity.details}\`!\n\n**Title:**\n${newActivity.name}`);

              if (userFetch.ok && userData.data.length > 0 && userData.data[0]) {
                twitchEmbed
                  .setThumbnail(userData.data[0].profile_image_url)
                  .setTitle(`${userData.data[0].display_name} just went live!`)
                  .setDescription(stripIndents`${userData.data[0].display_name} just started ${twitchEmbed.description}`)
                  .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${userData.data[0].login}-1920x1080.jpg`);
              }

              if (streamFetch.ok && streamData.data.length > 0 && streamData.data[0]) {
                const streamTime = moment(streamData.data[0].started_at).isValid() ? moment(streamData.data[0].started_at)._d : null;

                twitchEmbed.setFooter('Stream started');
                streamTime ? twitchEmbed.setTimestamp(streamTime) : null;
              }
              if (twitchChannel) {
                curGuild.channels.get(twitchChannel).send('', {embed: twitchEmbed});
              }
            }
          } catch (err) {
            this.client.channels.resolve('395658199266623528').send(stripIndents`
              <@${this.client.owners[0].id}> Error occurred in sending a twitch live notifier!
              **Server:** ${curGuild.name} (${curGuild.id})
              **Member:** ${curUser.tag} (${curUser.id})
              **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
              **Old Activity:** ${oldActivity.url}
              **New Activity:** ${newActivity.url}
              **Error Message:** ${err}
              `);
          }
        }
      }
    };
  }

  onReady () {
    return () => {
      // eslint-disable-next-line no-console
      console.log(oneLine`Client ready at ${moment().format('HH:mm:ss')};
        logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);
      const bot = this.client;

      setInterval(() => {
        forceStopTyping(bot);
        timerMessages(bot);
        countdownMessages(bot);
      }, ms('3m'));

      setInterval(() => {
        checkReminders(bot);
      }, ms('5m'));

      setInterval(() => {
        lotto(bot);
        fetchEshop(bot);
      }, ms('24h'));

      fs.watch(path.join(__dirname, 'data/dex/formats.json'), (eventType, filename) => {
        if (filename) {
          decache(path.join(__dirname, 'data/dex/formats.json'));
          this.client.registry.resolveCommand('pokemon:dex').reload();
        }
      });
    };
  }

  onRateLimit () {
    return (info) => {
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      Ran into a **rate limit**!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Timeout**: ${info.timeout}
      **Limit**: ${info.limit}
      **HTTP Method**: ${info.method}
      **Path**: ${info.path}
      **Route**: ${info.route}
      `);
    };
  }

  onUnknownCommand () {
    return (msg) => {
      const {guild} = msg;

      if (guild && guild.settings.get('unknownmessages', true)) {
        msg.reply(stripIndents`${oneLine`That is not a registered command.
				Use \`${guild ? guild.commandPrefix : this.client.commandPrefix}help\`
				or @Ribbon#2325 help to view the list of all commands.`}
				${oneLine`Server staff (those who can manage other's messages) can disable these replies by using
				\`${guild ? guild.commandPrefix : this.client.commandPrefix}unknownmessages disable\``}`);
      }
    };
  }

  onWarn () {
    return (warn) => {
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      Caught **General Warning**!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Warning Message:** ${warn}
      `);
    };
  }

  init () {
    this.client
      .on('commandError', this.onCmdErr())
      .on('debug', console.log) // eslint-disable-line no-console
      .on('error', this.onErr())
      .on('guildCreate', this.onGuildJoin())
      .on('guildDelete', this.onGuildLeave())
      .on('guildMemberAdd', this.onGuildMemberAdd())
      .on('guildMemberRemove', this.onGuildMemberRemove())
      .on('message', this.onMessage())
      .on('presenceUpdate', this.onPresenceUpdate())
      .on('rateLimit', this.onRateLimit())
      .on('ready', this.onReady())
      .on('unknownCommand', this.onUnknownCommand())
      .on('warn', this.onWarn());

    const db = new Database(path.join(__dirname, 'data/databases/settings.sqlite3'));

    this.client.setProvider(
      new SyncSQLiteProvider(db)
    );

    this.client.registry
      .registerGroups([
        ['games', 'Games - Play some games'],
        ['casino', 'Casino - Gain and gamble points'],
        ['info', 'Info - Discord info at your fingertips'],
        ['music', 'Music - Let the DJ out'],
        ['searches', 'Searches - Browse the web and find results'],
        ['leaderboards', 'Leaderboards - View leaderboards from various games'],
        ['pokemon', 'Pokemon - Let Dexter answer your questions'],
        ['extra', 'Extra - Extra! Extra! Read All About It! Only Two Cents!'],
        ['weeb', 'Weeb - Hugs, Kisses, Slaps and all with weeb animu gifs'],
        ['moderation', 'Moderation - Moderate with no effort'],
        ['automod', 'Automod - Let Ribbon moderate the chat for you'],
        ['streamwatch', 'Streamwatch - Spy on members and get notified when they go live'],
        ['custom', 'Custom - Server specific commands'],
        ['nsfw', 'NSFW - For all you dirty minds ( ͡° ͜ʖ ͡°)'],
        ['owner', 'Owner - Exclusive to the bot owner(s)']
      ])
      .registerDefaultGroups()
      .registerDefaultTypes()
      .registerDefaultCommands({
        help: true,
        prefix: true,
        ping: true,
        eval_: true,
        commandState: true
      })
      .registerCommandsIn(path.join(__dirname, 'commands'));

    return this.client.login(this.token);
  }
}

module.exports = Ribbon;