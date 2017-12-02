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
	jsonfile = require('jsonfile'),
	moment = require('moment'),
	path = require('path');

module.exports = class listwarnCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'listwarn',
			'group': 'moderation',
			'aliases': ['reqwarn', 'lw', 'rw'],
			'memberName': 'listwarn',
			'description': 'Lists the warning points given to a member',
			'examples': ['listwarn {member}'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'member',
					'prompt': 'Which member to warn?',
					'type': 'member',
					'label': 'member name or ID'
				}
			]
		});
	}

	hasPermission (msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
	}

	run (msg, args) {
		const listWarnsEmbed = new Discord.MessageEmbed();

		jsonfile.readFile(path.join(__dirname, `data/${msg.guild.id}/warnlog.json`), 'utf8', (readErr, obj) => {
			if (readErr) {
				return msg.reply(`📘 No warnpoints log found for this server, it will be created the first time you use the \`${msg.guild.commandPrefix}warn\` command`);

			}

			if (!obj[args.member.id]) {
				return msg.reply('⚠️ That user has no warning points yet');
			}
			listWarnsEmbed
				.setColor('#FFFF00')
				.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
				.setFooter(moment().format('MMM Do YYYY | HH:mm:ss'))
				.setDescription(`**Member:** ${args.member.user.tag} (${args.member.id})\n` +
                    `**Current Warning Points:** ${obj[args.member.id].points}`);

			return msg.embed(listWarnsEmbed);
		});
	}
};