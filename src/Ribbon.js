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

/**
 * TO DO LIST OF COMMANDS
 * Info: bot stats (in need of suggestions of what to put other than server count)
 * music: play, disconnect, np, skip, remove, loopqueue, loop, join, resume, move, skipto, clear, replay, pause, removedupes, volume (services: youtube and 
 * sharding of music commands I guess :v that's gonna be fun
 */

// eslint-disable-next-line no-mixed-requires
const Commando = require('discord.js-commando'),
	Discord = require('discord.js'),
	Path = require('path'),
	auth = require(Path.join(`${__dirname}/auth.json`)),
	moment = require('moment'),
	oneLine = require('common-tags'),
	ownerID = auth.ownerID, // eslint-disable-line prefer-destructuring
	sqlite = require('sqlite');

class Ribbon {
	constructor (token) { // eslint-disable-line no-unused-vars
		this.bootTime = new Date();
		this.token = auth.token;
		this.client = new Commando.Client({
			'owner': ownerID,
			'commandPrefix': '%',
			'selfbot': false
		});
		this.isReady = false;
	}

	onReady () {
		return () => {
			console.log(`Client ready; logged in as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`); // eslint-disable-line no-console

			this.isReady = true;
		};
	}

	onCommandPrefixChange () {
		return (guild, prefix) => {
			// eslint-disable-next-line no-console
			console.log(oneLine ` 
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
		};
	}

	onDisconnect () {
		return () => {
			console.warn('Disconnected!'); // eslint-disable-line no-console
		};
	}

	onReconnect () {
		return () => {
			console.warn('Reconnecting...'); // eslint-disable-line no-console
		};
	}

	onCmdErr () {
		return (cmd, err) => {
			if (err instanceof Commando.FriendlyError) {
				return;
			}
			console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err); // eslint-disable-line no-console
		};
	}

	onCmdBlock () {
		return (msg, reason) => {
			// eslint-disable-next-line no-console
			console.log(oneLine `
		Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
		blocked; ${reason}
	`);
		};
	}

	onCmdStatusChange () {
		return (guild, command, enabled) => {
			// eslint-disable-next-line no-console
			console.log(oneLine `
            Command ${command.groupID}:${command.memberName}
            ${enabled ? 'enabled' : 'disabled'}
            ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
        `);
		};
	}

	onGroupStatusChange () {
		return (guild, group, enabled) => {
			// eslint-disable-next-line no-console
			console.log(oneLine `
            Group ${group.id}
            ${enabled ? 'enabled' : 'disabled'}
            ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
        `);
		};
	}

	onMessage () {
		return (msg) => {
			if (!msg.guild.available) {
				return; // eslint-disable-line no-useless-return
			}
		};
	}

	onGuildMemberAdd () {
		return (member) => {
			const embed = new Discord.MessageEmbed(),
				memberLogs = member.guild.channels.exists('name', 'member-logs') ? member.guild.channels.find('name', 'member-logs') : null;

			embed.setAuthor(`${member.user.tag} (${member.id})`, member.displayAvatarURL)
				.setFooter(`User joined | ${moment().format('ddd MMM Do, YYYY at HH:mm')}`)
				.setColor('#80F31F');

			memberLogs !== null ? memberLogs.send({embed}) : null;
		};
	}

	onGuildMemberRemove () {
		return (member) => {
			const embed = new Discord.MessageEmbed(),
				memberLogs = member.guild.channels.exists('name', 'member-logs') ? member.guild.channels.find('name', 'member-logs') : null;

			embed.setAuthor(`${member.user.tag} (${member.id})`, member.displayAvatarURL)
				.setFooter(`User left | ${moment().format('ddd MMM Do, YYYY at HH:mm')}`)
				.setColor('#F4BF42');
			memberLogs !== null ? memberLogs.send({embed}) : null;
		};
	}

	init () {
		this.client
			.on('ready', this.onReady())
			.on('commandPrefixChange', this.onCommandPrefixChange())
			.on('error', console.error) // eslint-disable-line no-console
			.on('warn', console.warn) // eslint-disable-line no-console
			.on('debug', console.log) // eslint-disable-line no-console
			.on('disconnect', this.onDisconnect())
			.on('reconnecting', this.onReconnect())
			.on('commandError', this.onCmdErr())
			.on('commandBlocked', this.onCmdBlock())
			.on('commandStatusChange', this.onCmdStatusChange())
			.on('groupStatusChange', this.onGroupStatusChange())
			.on('guildMemberAdd', this.onGuildMemberAdd())
			.on('guildMemberRemove', this.onGuildMemberRemove())
			.on('message', this.onMessage());

		this.client.setProvider(
			sqlite.open(Path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
		).catch(console.error); // eslint-disable-line no-console

		this.client.registry
			.registerGroups([
				['fun', 'Fun and Games Commands'],
				['info', 'Information Commands'],
				['links', 'Quick links'],
				['misc', 'Miscellanious Commands'],
				['moderation', 'Moderate your server'],
				['music', 'Jam out to music'],
				['nsfw', 'NSFW finding commands'],
				['pokedex', 'PokéDex Lookup Commands'],
				['search', 'Web Searching Commands']
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
			.registerCommandsIn(Path.join(__dirname, 'commands'));

		return this.client.login(this.token);
	}

	deinit () {
		this.isReady = false;

		return this.client.destroy();
	}
}

module.exports = Ribbon;