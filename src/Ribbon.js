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
const Commando = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  moment = require('moment'),
  path = require('path'),
  request = require('snekfetch'),
  sqlite = require('sqlite'),
  {twitchclientid} = require(`${__dirname}/auth.json`),
  {oneLine, stripIndents} = require('common-tags');
/* eslint-enable sort-vars */

class Ribbon {
  constructor (token) {
    this.token = token;
    this.client = new Commando.Client({
      'commandPrefix': '!',
      'owner': '112001393140723712',
      'selfbot': false,
      'unknownCommandResponse': false,
      'presence': {
        'status': 'online',
        'activity': {
          'application': '376520643862331396',
          'name': '@Ribbon help',
          'type': 'WATCHING',
          'details': 'Made by Favna',
          'state': 'https://favna.xyz/ribbon',
          'assets': {
            'largeImage': '385133227997921280',
            'smallImage': '385133144245927946',
            'largeText': 'Invite me to your server!',
            'smallText': 'Look at the website!'
          }
        }
      }
    });
    this.isReady = false;
  }

  onCmdBlock () {
    return (msg, reason) => {
      console.log(oneLine`
		Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
		blocked; ${reason}
	`);
    };
  }

  onCmdErr () {
    return (cmd, err) => {
      if (err instanceof Commando.FriendlyError) {
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
      console.error(`${stripIndents`A websocket error occurred!
      Time: ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      Error Message:`} ${e}`);
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
        const embed = new MessageEmbed(),
          memberLogs = this.client.provider.get(member.guild, 'memberlogchannel',
            member.guild.channels.exists('name', 'member-logs')
              ? member.guild.channels.find('name', 'member-logs').id
              : null);

        embed.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL({'format': 'png'}))
          .setFooter(`User joined | ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`)
          .setColor('#80F31F');

        if (this.client.provider.get(member.guild.id, 'defaultRole')) {
          member.roles.add(this.client.provider.get(member.guild.id, 'defaultRole'));
          embed.setDescription(`Automatically assigned the role ${member.guild.roles.get(this.client.provider.get(member.guild.id, 'defaultRole')).name} to this member`);
        }

        if (memberLogs !== null && member.guild.channels.get(memberLogs).permissionsFor(this.client.user)
          .has('SEND_MESSAGES')) {
          member.guild.channels.get(memberLogs).send({embed});
        }
      }
    };
  }

  onGuildMemberRemove () {
    return (member) => {
      if (this.client.provider.get(member.guild, 'memberlogs', true)) {
        const embed = new MessageEmbed(),
          memberLogs = this.client.provider.get(member.guild, 'memberlogchannel',
            member.guild.channels.exists('name', 'member-logs')
              ? member.guild.channels.find('name', 'member-logs').id
              : null);

        embed.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL({'format': 'png'}))
          .setFooter(`User left | ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`)
          .setColor('#F4BF42');

        if (memberLogs !== null && member.guild.channels.get(memberLogs).permissionsFor(this.client.user)
          .has('SEND_MESSAGES')) {
          member.guild.channels.get(memberLogs).send({embed});
        }
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
            oldActivity = {'url': 'placeholder'};
          }
          if (!newActivity) {
            newActivity = {'url': 'placeholder'};
          }
          if (!(/(twitch)/i).test(oldActivity.url) && (/(twitch)/i).test(newActivity.url)) {

            /* eslint-disable sort-vars*/
            const userData = await request.get('https://api.twitch.tv/kraken/users')
                .set('Accept', 'application/vnd.twitchtv.v5+json')
                .set('Client-ID', twitchclientid)
                .query('login', newActivity.url.split('/')[3]),
              streamData = await request.get('https://api.twitch.tv/kraken/streams')
                .set('Accept', 'application/vnd.twitchtv.v5+json')
                .set('Client-ID', twitchclientid)
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
              curGuild.channels.get(twitchChannel).send({'embed': twitchEmbed});
            }
          }
        }
      }
    };
  }

  onReady () {
    return () => {
      console.log(`Client ready; logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);
      this.isReady = true;

      /**
       * @todo Periodic Casino Lottery
       * @body Every 24 hours check which guilds are in Casino database then which members are in those guild. Pick a random one to give free 1000 chips
       */

      /**
       * @todo RemindMe system
       * @body let people store reminders on the bot. Store in SQL Database `reminders.sqlite`.  
       * First onReady store the timestamps in object then on interval check the object of timestamps and if any has passed remind that person with their text
       */
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

    this.client.setProvider(
      sqlite.open(path.join(__dirname, 'data/databases/settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
    ).catch(console.error);

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
        'help': true,
        'prefix': true,
        'ping': true,
        'eval_': true,
        'commandState': true
      })
      .registerCommandsIn(path.join(__dirname, 'commands'));

    return this.client.login(this.token);
  }

  deinit () {
    this.isReady = false;

    return this.client.destroy();
  }
}

module.exports = Ribbon;