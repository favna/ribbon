/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

/* eslint-disable sort-vars */
const Database = require('better-sqlite3'),
  Jimp = require('jimp'),
  imgur = require('imgur'),
  moment = require('moment'),
  path = require('path'),
  request = require('snekfetch'),
  {Client, FriendlyError, SyncSQLiteProvider} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {promisify} = require('util'),
  {oneLine, stripIndents} = require('common-tags'),
  {ordinal} = require(path.join(__dirname, 'util.js'));
/* eslint-enable sort-vars */

class Ribbon {
  constructor (token) {
    this.token = token;
    this.client = new Client({
      commandPrefix: '!',
      owner: '112001393140723712',
      selfbot: false,
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
            smallText: 'Look at the website!'
          }
        }
      }
    });
  }

  checkReminders () {
    const conn = new Database(path.join(__dirname, 'data/databases/reminders.sqlite3'));

    try {
      const query = conn.prepare('SELECT * FROM "reminders"').all();

      for (const row in query) {
        const remindTime = moment(query[row].remindTime),
          dura = moment.duration(remindTime.diff()); // eslint-disable-line sort-vars

        if (dura.asMinutes() <= 0) {
          this.client.users.resolve(query[row].userID).send({
            embed: {
              color: 10610610,
              description: query[row].remindText,
              author: {
                name: 'Ribbon Reminders',
                iconURL: this.client.user.displayAvatarURL({format: 'png'})
              },
              thumbnail: {url: 'https://favna.xyz/images/ribbonhost/reminders.png'}
            }
          });
          conn.prepare('DELETE FROM "reminders" WHERE userID = $userid AND remindTime = $remindTime').run({
            userid: query[row].userID,
            remindTime: query[row].remindTime
          });
        }
      }
    } catch (err) {
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred sending someone their reminder!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
    }
  }

  lotto () {
    const conn = new Database(path.join(__dirname, 'data/databases/casino.sqlite3'));

    try {
      const tables = conn.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all();

      for (const row in tables) {
        const guildData = conn.prepare(`SELECT * FROM "${tables[row].name}"`).all(),
          winner = Math.floor(Math.random() * guildData.length),
          prevBal = guildData[winner].balance; // eslint-disable-line sort-vars

        guildData[winner].balance += 2000;

        conn.prepare(`UPDATE "${tables[row].name}" SET balance=$balance WHERE userID="${guildData[winner].userID}"`).run({balance: guildData[winner].balance});

        // eslint-disable-next-line one-var
        const defaultChannel = this.client.guilds.resolve(tables[row].name).systemChannel,
          winnerEmbed = new MessageEmbed(),
          winnerLastMessage = this.client.guilds.resolve(tables[row].name).members.get('112001393140723712').lastMessageChannelID,
          winnerLastMessageChannel = winnerLastMessage ? this.client.guilds.resolve(tables[row].name).channels.get(winnerLastMessage) : null,
          winnerLastMessageChannelPermitted = winnerLastMessageChannel ? winnerLastMessageChannel.permissionsFor(this.client.user).has('SEND_MESSAGES') : false;

        winnerEmbed
          .setColor('#7CFC00')
          .setDescription(`Congratulations <@${guildData[winner].userID}>! You won today's random lotto and were granted 2000 chips 🎉!`)
          .setAuthor(this.client.guilds.resolve(tables[row].name).members.get(guildData[winner].userID).displayName,
            this.client.guilds.resolve(tables[row].name).members.get(guildData[winner].userID).user.displayAvatarURL({format: 'png'}))
          .setThumbnail('https://favna.xyz/images/ribbonhost/casinologo.png')
          .addField('Balance', `${prevBal} ➡ ${guildData[winner].balance}`);

        if (winnerLastMessageChannelPermitted) {
          winnerLastMessageChannel.send(`<@${guildData[winner].userID}>`, {embed: winnerEmbed});
        } else if (defaultChannel) {
          defaultChannel.send(`<@${guildData[winner].userID}>`, {embed: winnerEmbed});
        }
      }
    } catch (err) {
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred giving someone their lotto payout!
      **Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);
    }
  }

  forceStopTyping () {
    const allChannels = this.client.channels;

    for (const channel of allChannels.values()) {
      if (channel.type === 'text' || channel.type === 'dm' || channel.type === 'group') {
        if (this.client.user.typingDurationIn(channel) > 10000) {
          channel.stopTyping(true);
        }
      }
    }
  }

  async joinmessage (member) {
    Jimp.prototype.getBase64Async = promisify(Jimp.prototype.getBase64);
    /* eslint-disable sort-vars*/
    const avatar = await Jimp.read(member.user.displayAvatarURL({format: 'png'})),
      border = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/border.png'),
      canvas = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/canvas.png'),
      newMemberEmbed = new MessageEmbed(),
      fontLarge = await Jimp.loadFont(path.join(__dirname, 'data/fonts/roboto-large.fnt')),
      fontMedium = await Jimp.loadFont(path.join(__dirname, 'data/fonts/roboto-medium.fnt')),
      mask = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/mask.png');
    /* eslint-enable sort-vars*/

    avatar.resize(136, Jimp.AUTO);
    mask.resize(136, Jimp.AUTO);
    border.resize(136, Jimp.AUTO);
    avatar.mask(mask, 0, 0);
    avatar.composite(border, 0, 0);
    canvas.blit(avatar, 5, 5);
    canvas.print(fontLarge, 155, 10, 'welcome'.toUpperCase());
    canvas.print(fontMedium, 160, 60, `you are the ${ordinal(member.guild.memberCount)} member`.toUpperCase());
    canvas.print(fontMedium, 160, 80, `of ${member.guild.name}`.toUpperCase());

    const base64 = await canvas.getBase64Async(Jimp.MIME_PNG), // eslint-disable-line one-var
      upload = await imgur.uploadBase64(base64.slice(base64.indexOf(',') + 1));

    newMemberEmbed
      .setColor('#80F31F')
      .setTitle('NEW MEMBER!')
      .setDescription(`Please give a warm welcome to <@${member.id}>`)
      .setImage(upload.data.link);

    member.guild.channels.get(member.guild.settings.get('joinmsgchannel')).send('', {embed: newMemberEmbed});
  }

  async leavemessages (member) {
    Jimp.prototype.getBase64Async = promisify(Jimp.prototype.getBase64);
    /* eslint-disable sort-vars*/
    const avatar = await Jimp.read(member.user.displayAvatarURL({format: 'png'})),
      border = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/border.png'),
      canvas = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/canvas.png'),
      leaveMemberEmbed = new MessageEmbed(),
      fontLarge = await Jimp.loadFont(path.join(__dirname, 'data/fonts/roboto-large.fnt')),
      fontMedium = await Jimp.loadFont(path.join(__dirname, 'data/fonts/roboto-medium.fnt')),
      mask = await Jimp.read('https://www.favna.xyz/images/ribbonhost/jimp/mask.png');
      /* eslint-enable sort-vars*/

    avatar.resize(136, Jimp.AUTO);
    mask.resize(136, Jimp.AUTO);
    border.resize(136, Jimp.AUTO);
    avatar.mask(mask, 0, 0);
    avatar.composite(border, 0, 0);
    canvas.blit(avatar, 5, 5);
    canvas.print(fontLarge, 155, 10, 'goodbye'.toUpperCase());
    canvas.print(fontMedium, 160, 60, `there are now ${member.guild.memberCount} members`.toUpperCase());
    canvas.print(fontMedium, 160, 80, `on ${member.guild.name}`.toUpperCase());

    const base64 = await canvas.getBase64Async(Jimp.MIME_PNG), // eslint-disable-line one-var
      upload = await imgur.uploadBase64(base64.slice(base64.indexOf(',') + 1));

    leaveMemberEmbed
      .setColor('#F4BF42')
      .setTitle('Member Left 😢')
      .setDescription(`You will be missed <@${member.id}>`)
      .setImage(upload.data.link);

    member.guild.channels.get(member.guild.settings.get('leavemsgchannel')).send('', {embed: leaveMemberEmbed});
  }

  onCmdBlock () {
    return (msg, reason) => {
      console.log(oneLine`
		Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
		blocked; ${reason}`);
    };
  }

  onCmdErr () {
    return (cmd, err) => {
      if (err instanceof FriendlyError) {
        return;
      }
      console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
    };
  }

  onCommandPrefixChange () {
    return (guild, prefix) => {
      console.log(oneLine` 
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    };
  }

  onCmdStatusChange () {
    return (guild, command, enabled) => {
      console.log(oneLine`
            Command ${command.groupID}:${command.memberName}
            ${enabled ? 'enabled' : 'disabled'}
            ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
        `);
    };
  }

  onDisconnect () {
    return () => {
      console.warn('Disconnected!');
    };
  }

  onError () {
    return (e) => {
      console.error(e);
    };
  }

  onGroupStatusChange () {
    return (guild, group, enabled) => {
      console.log(oneLine`
            Group ${group.id}
            ${enabled ? 'enabled' : 'disabled'}
            ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
        `);
    };
  }

  onGuildMemberAdd () {
    return (member) => {
      if (this.client.provider.get(member.guild, 'memberlogs', true)) {
        const memberJoinLogEmbed = new MessageEmbed(),
          memberLogs = this.client.provider.get(member.guild, 'memberlogchannel',
            member.guild.channels.exists('name', 'member-logs')
              ? member.guild.channels.find('name', 'member-logs').id
              : null);

        memberJoinLogEmbed.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL({format: 'png'}))
          .setFooter('User joined')
          .setTimestamp()
          .setColor('#80F31F');

        if (this.client.provider.get(member.guild.id, 'defaultRole')) {
          member.roles.add(this.client.provider.get(member.guild.id, 'defaultRole'));
          memberJoinLogEmbed.setDescription(`Automatically assigned the role ${member.guild.roles.get(this.client.provider.get(member.guild.id, 'defaultRole')).name} to this member`);
        }

        if (memberLogs && member.guild.channels.get(memberLogs).permissionsFor(this.client.user)
          .has('SEND_MESSAGES')) {
          member.guild.channels.get(memberLogs).send('', {embed: memberJoinLogEmbed});
        }
      }

      if (member.guild.settings.get('joinmsgs', false) && member.guild.settings.get('joinmsgchannel', null)) {
        this.joinmessage(member);
      }
    };
  }

  onGuildMemberRemove () {
    return (member) => {
      if (this.client.provider.get(member.guild, 'memberlogs', true)) {
        const memberLeaveLogEmbed = new MessageEmbed(),
          memberLogs = this.client.provider.get(member.guild, 'memberlogchannel',
            member.guild.channels.exists('name', 'member-logs')
              ? member.guild.channels.find('name', 'member-logs').id
              : null);

        memberLeaveLogEmbed.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL({format: 'png'}))
          .setFooter('User left')
          .setTimestamp()
          .setColor('#F4BF42');

        if (memberLogs !== null && member.guild.channels.get(memberLogs).permissionsFor(this.client.user)
          .has('SEND_MESSAGES')) {
          member.guild.channels.get(memberLogs).send('', {embed: memberLeaveLogEmbed});
        }
      }

      try {
        const conn = new Database(path.join(__dirname, 'data/databases/casino.sqlite3')),
          query = conn.prepare(`SELECT * FROM "${member.guild.id}" WHERE userID = ?`).get(member.id);

        if (query) {
          conn.prepare(`DELETE FROM "${member.guild.id}" WHERE userID = ?`).run(member.id);
        }
      } catch (err) {
        null;
      }

      if (member.guild.settings.get('leavemsgs', false) && member.guild.settings.get('leavemsgchannel', null)) {
        this.leavemessages(member);
      }
    };
  }

  onPresenceUpdate () {
    return async (oldMember, newMember) => {
      if (this.client.provider.get(newMember.guild, 'twitchmonitors', []).includes(newMember.id)) {
        if (this.client.provider.get(newMember.guild, 'twitchnotifiers', false)) {
          const curDisplayName = newMember.displayName,
            curGuild = newMember.guild,
            curUser = newMember.user;

          let newActivity = newMember.presence.activity,
            oldActivity = oldMember.presence.activity;

          if (!oldActivity) {
            oldActivity = {url: 'placeholder'};
          }
          if (!newActivity) {
            newActivity = {url: 'placeholder'};
          }
          if (!(/(twitch)/i).test(oldActivity.url) && (/(twitch)/i).test(newActivity.url)) {

            /* eslint-disable sort-vars*/
            const userData = await request.get('https://api.twitch.tv/kraken/users')
                .set('Accept', 'application/vnd.twitchtv.v5+json')
                .set('Client-ID', process.env.twitchclientid)
                .query('login', newActivity.url.split('/')[3]),
              streamData = await request.get('https://api.twitch.tv/kraken/streams')
                .set('Accept', 'application/vnd.twitchtv.v5+json')
                .set('Client-ID', process.env.twitchclientid)
                .query('channel', userData.body.users[0]._id),
              twitchChannel = this.client.provider.get(curGuild, 'twitchchannel', null),
              twitchEmbed = new MessageEmbed();
            /* eslint-enable sort-vars*/

            twitchEmbed
              .setThumbnail(curUser.displayAvatarURL())
              .setURL(newActivity.url)
              .setColor('#6441A4')
              .setTitle(`${curDisplayName} just went live!`)
              .setDescription(stripIndents`streaming \`${newActivity.details}\`!\n\n**Title:**\n${newActivity.name}`);

            if (userData.ok && userData.body._total > 0 && userData.body.users[0]) {
              twitchEmbed
                .setThumbnail(userData.body.users[0].logo)
                .setTitle(`${userData.body.users[0].display_name} just went live!`)
                .setDescription(stripIndents`${userData.body.users[0].display_name} just started ${twitchEmbed.description}`);
            }

            if (streamData.ok && streamData.body._total > 0 && streamData.body.streams[0]) {
              twitchEmbed.setDescription(stripIndents`${twitchEmbed.description}\n
                **Stream Started At**${moment(streamData.body.streams[0].created_at).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`)
                .setImage(streamData.body.streams[0].preview.large);
            }
            if (twitchChannel) {
              curGuild.channels.get(twitchChannel).send({embed: twitchEmbed});
            }
          }
        }
      }
    };
  }

  onReady () {
    return () => {
      console.log(`Client ready; logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);
      const bot = this;

      setInterval(() => {
        bot.forceStopTyping();
      }, 180000);

      setInterval(() => {
        bot.checkReminders();
      }, 300000);

      setInterval(() => {
        bot.lotto();
      }, 86400000);
    };
  }

  onReconnect () {
    return () => {
      console.warn('Reconnecting...');
    };
  }

  onUnknownCommand () {
    return (msg) => {
      if (this.client.provider.get(msg.guild, 'unknownmessages', true)) {
        return msg.reply(stripIndents`${oneLine`That is not a registered command.
				Use \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}help\`
				or @Ribbon#2325 help to view the list of all commands.`}
				${oneLine`Server staff (those who can manage other's messages) can disable these replies by using
				\`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}unknownmessages disable\``}`);
      }

      return null;
    };
  }

  init () {
    this.client
      .on('commandBlocked', this.onCmdBlock())
      .on('commandError', this.onCmdErr())
      .on('commandPrefixChange', this.onCommandPrefixChange())
      .on('commandStatusChange', this.onCmdStatusChange())
      .on('debug', console.log)
      .on('disconnect', this.onDisconnect())
      .on('error', this.onError())
      .on('groupStatusChange', this.onGroupStatusChange())
      .on('guildMemberAdd', this.onGuildMemberAdd())
      .on('guildMemberRemove', this.onGuildMemberRemove())
      .on('presenceUpdate', this.onPresenceUpdate())
      .on('ready', this.onReady())
      .on('reconnecting', this.onReconnect())
      .on('unknownCommand', this.onUnknownCommand())
      .on('warn', console.warn);

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
        ['moderation', 'Moderation - Moderate with no effort'],
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