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

const Discord = require('discord.js'),
	commando = require('discord.js-commando'),
	moment = require('moment');

const contentFilter = ['Content filter disabled', 'Scan messages of members without a role', 'Scan messages sent by all members'], // eslint-disable-line one-var
	verificationLevel = [
		'None - unrestricted',
		'Low - must have verified email on account',
		'Medium - must be registered on Discord for longer than 5 minutes',
		'High - 	(╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes',
		'Very High - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number'
	];

module.exports = class serverInfoCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'server',
			'aliases': ['serverinfo', 'sinfo'],
			'group': 'info',
			'memberName': 'server',
			'description': 'Gets information about the server.',
			'examples': ['server {serverName ID (partial or full)}', 'server Favna\'s Selfbot'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			}
		});
	}

	run (msg, args) {
		if (msg.channel.type !== 'text' && args.server === 'current') {
			return msg.reply('An argument of server name (partial or full) or server ID is required when talking outside of a server');
		}

		const channels = msg.guild.channels.map(ty => ty.type), // eslint-disable-line sort-vars
			presences = msg.guild.presences.map(st => st.status),
			serverEmbed = new Discord.MessageEmbed();

		let guildChannels = 0,
			onlineMembers = 0;

		for (const i in presences) {
			if (presences[i] !== 'offline') {
				onlineMembers += 1;
			}
		}
		for (const i in channels) {
			if (channels[i] === 'text') {
				guildChannels += 1;
			}
		}

		serverEmbed
			.setColor(msg.guild.owner ? msg.guild.owner.displayHexColor : '#E24141')
			.setAuthor('Server Info', 'https://favna.s-ul.eu/O0qc0yt7.png')
			.setThumbnail(msg.guild.iconURL({'format': 'png'}))
			.setFooter(`Server ID: ${msg.guild.id}`)
			.addField('Server Name', msg.guild.name, true)
			.addField('Owner', msg.guild.owner ? msg.guild.owner.user.tag : 'Owner is MIA', true)
			.addField('Members', msg.guild.memberCount, true)
			.addField('Currently Online', onlineMembers, true)
			.addField('Region', msg.guild.region, true)
			.addField('Highest Role', msg.guild.roles.sort((a, b) => a.position - b.position || a.id - b.id).last().name, true)
			.addField('Number of emojis', msg.guild.emojis.size, true)
			.addField('Number of roles', msg.guild.roles.size, true)
			.addField('Number of channels', guildChannels, true)
			.addField('Created At', moment(msg.guild.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z'), false)
			.addField('Verification Level', verificationLevel[msg.guild.verificationLevel], false)
			.addField('Explicit Content Filter', contentFilter[`${msg.guild.explicitContentFilter}`], false);

		msg.guild.splashURL() !== null ? serverEmbed.setImage(msg.guild.splashURL()) : null;

		return msg.embed(serverEmbed);
	}
};