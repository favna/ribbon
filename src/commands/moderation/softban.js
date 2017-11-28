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

module.exports = class softbanCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'softban',
			'group': 'moderation',
			'aliases': ['sb', 'sban'],
			'memberName': 'softban',
			'description': 'Kicks a member while also purging messages from the last 24 hours',
			'examples': ['softban {member} {reason}'],
			'guildOnly': true,
			'throttling': {
				'usages': 1,
				'duration': 60
			},

			'args': [
				{
					'key': 'member',
					'prompt': 'Which member to softban?',
					'type': 'member'
				},
				{
					'key': 'reason',
					'prompt': 'Reason for softbanning?',
					'type': 'string'
				}
			]
		});
	}

	hasPermission (msg) {
		return msg.member.hasPermission('BAN_MEMBERS');
	}

	run (msg, args) {
		if (args.member.id === msg.author.id) {
			return msg.reply('⚠️ I don\'t think you want to softban yourself.');
		}

		if (!args.member.bannable) {
			return msg.reply('⚠️ I cannot softban that member, their role is probably higher than my own!');
		}

		args.member.ban({
			'days': 1,
			'reason': args.reason
		});

		msg.guild.unban(args.member.user);

		const modLogs = msg.guild.channels.exists('name', 'mod-logs') ? msg.guild.channels.find('name', 'mod-logs') : null,
			softBanEmbed = new Discord.MessageEmbed();

		softBanEmbed
			.setColor('#FF1900')
			.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
			.setDescription(`**Member:** ${args.member.user.tag} (${args.member.id})\n` +
                '**Action:** Softban\n' +
                `**Reason:** ${args.reason}`)
			.setFooter(moment().format('MMM Do YYYY | HH:mm:ss'));

		return modLogs !== null ? modLogs.send({'embed': softBanEmbed}) : msg.reply('📃 I can keep a log of bans if you create a channel named \'mod-logs\' and give me access to it');
	}
};