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
			console.log(oneLine `
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
			console.log(oneLine ` 
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
		};
	}

	onCmdStatusChange () {
		return (guild, command, enabled) => {
			console.log(oneLine `
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

	onGroupStatusChange () {
		return (guild, group, enabled) => {
			console.log(oneLine `
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

	onMessage () {
		return (msg) => {
			if (msg.guild) {
				if (!msg.guild.available) {
					return null;
				}
			}
		};
	}

	onReady () {
		return () => {
			console.log(`Client ready; logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);
			this.isReady = true;
		};
	}

	onReconnect () {
		return () => {
			console.warn('Reconnecting...');
		};
	}

	onPresenceUpdate () {
		return (oldMember, newMember) => {
			console.log(stripIndents `presenceUpdate detected!
			User: ${newMember.user.tag}
			Server: ${newMember.guild.name} (${newMember.guild.id})
			New Activity: ${newMember.presence.activity}`);

			if (!oldMember.presence.activity) {
				oldMember.presence.activity = {'url': 'placeholder'};
			}
			if (!newMember.presence.activity) {
				newMember.presence.activity = {'url': 'placeholder'};
			}
			if (!(/(twitch)/i).test(oldMember.presence.activity.url) && (/(twitch)/i).test(newMember.presence.activity.url)) {
				if (this.client.provider.get(newMember.guild, 'twitchnotifiersenabled', false)) {
					if (this.client.provider.get(newMember.guild, 'twitchmonitors', []).includes(newMember.id)) {
						console.log('Passed the check if the member appears in the to monitor users');
						const twitchChannel = this.client.provider.get(newMember.guild, 'twitchchannel', null),
							twitchEmbed = new MessageEmbed();

						request.get('https://api.twitch.tv/kraken/users')
							.set('Accept', 'application/vnd.twitchtv.v5+json')
							.set('Client-ID', twitchclientid)
							.query('login', newMember.presence.activity.url.split('/')[3])
							.then((userData) => {
								twitchEmbed
									.setThumbnail(newMember.user.displayAvatarURL())
									.setURL(newMember.presence.activity.url)
									.setColor('#6441A4')
									.setTitle(`${newMember.displayName} just went live!`)
									.setDescription(stripIndents `streaming \`${newMember.presence.activity.details}\`!\n\n**Title:**\n${newMember.presence.activity.name}`);

								if (userData.ok) {
									request.get('https://api.twitch.tv/kraken/streams')
										.set('Accept', 'application/vnd.twitchtv.v5+json')
										.set('Client-ID', twitchclientid)
										.query('channel', userData.body.users[0]._id)
										.then((streamData) => {
											twitchEmbed
												.setThumbnail(userData.body.users[0].logo)
												.setTitle(`${userData.body.users[0].display_name} just went live!`)
												.setDescription(stripIndents `${userData.body.users[0].display_name} just started ${twitchEmbed.description}`);

											if (streamData.ok) {
												twitchEmbed
													.setDescription(stripIndents `${twitchEmbed.description}\n\n**Stream Started At**
																	${moment(streamData.body.streams[0].created_at).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`)
													.setImage(streamData.body.streams[0].preview.large);
											}
											if (twitchChannel) {
												return newMember.guild.channels.get(twitchChannel).send({'embed': twitchEmbed});
											}

											return null;
										});
								}

								return null;
							});
					}
				}
			}
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
			.on('error', console.error)
			.on('groupStatusChange', this.onGroupStatusChange())
			.on('guildMemberAdd', this.onGuildMemberAdd())
			.on('guildMemberRemove', this.onGuildMemberRemove())
			.on('message', this.onMessage())
			.on('presenceUpdate', this.onPresenceUpdate())
			.on('ready', this.onReady())
			.on('reconnecting', this.onReconnect())
			.on('warn', console.warn);

		this.client.setProvider(
			sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
		).catch(console.error);

		this.client.registry
			.registerGroups([
				['custom', 'Custom commands for servers'],
				['fun', 'Fun and Games to play with the bot'],
				['info', 'Get Information on various things'],
				['links', 'Quick Website Links'],
				['misc', 'Commands that cannot be categorized elsewhere'],
				['moderation', 'Moderate your server'],
				['music', 'Jam out to music'],
				['nsfw', 'Find NSFW content ( ͡° ͜ʖ ͡°)'],
				['owner', 'Owner only commands'],
				['pokedex', 'Get information from the PokéDex'],
				['search', 'Search the web']
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