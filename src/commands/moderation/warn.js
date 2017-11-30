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
	fs = require('fs'),
	jsonfile = require('jsonfile'),
	moment = require('moment'),
	{oneLine} = require('common-tags'),
	path = require('path');

module.exports = class warnCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'warn',
			'group': 'moderation',
			'aliases': ['warning'],
			'memberName': 'warn',
			'description': 'Warn a member with a specified amount of points',
			'examples': ['warn {member} {points} {reason}'],
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
				},
				{
					'key': 'points',
					'prompt': 'What do you want me to announce?',
					'type': 'integer',
					'label': 'warn points to give'
				},
				{
					'key': 'reason',
					'prompt': 'What is the reason you want to warn the user?',
					'type': 'string',
					'label': 'reason for the warning',
					'default': ''
				}
			]
		});
	}

	hasPermission (msg) {
		return msg.member.hasPermission('ADMINISTRATOR');
	}

	run (msg, args) {
		const modLogs = msg.guild.channels.exists('name', 'mod-logs') ? msg.guild.channels.find('name', 'mod-logs') : null,
			warnEmbed = new Discord.MessageEmbed();


		let warnobj = {},
			warnpoints = 0;

		jsonfile.readFile(path.join(__dirname, `data/${msg.guild.id}/warnlog.json`), 'utf8', (readErr, obj) => {
			if (readErr) {
				msg.reply('📘 No warnpoints log found for this server, creating one and filling with the first warning data');

				warnobj = {
					[args.member.id]: {
						'usertag': args.member.user.tag,
						'points': args.points
					}
				};

				fs.mkdirSync(path.join(__dirname, `data/${msg.guild.id}`));
				jsonfile.writeFile(path.join(__dirname, `data/${msg.guild.id}/warnlog.json`), warnobj, {'flag': 'wx+'}, (writeNoFileErr) => {
					if (writeNoFileErr) {
						console.error(`Error in command: Warn\nServer: ${msg.guild.id} | ${msg.guild.name}\nError: ${writeNoFileErr}`); // eslint-disable-line no-console

						return msg.reply(oneLine `⚠️ An error occured writing the warning to disc and the error has been logged on Favna\'s end.
							You can contact my developer on his server. Use \`${msg.guild.commandPrefix}invite\` to get an invite to his server.`);
					}

					warnEmbed
						.setColor('#FFFF00')
						.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
						.setDescription(`**Member:** ${args.member.user.tag} (${args.member.id})\n` +
							'**Action:** Warn\n' +
							`**Previous Warning Points:** ${warnpoints}\n` +
							`**Current Warning Points:** ${args.points}\n` +
							`**Reason:** ${args.reason !== '' ? args.reason : 'No reason has been added by the moderator'}`)
						.setFooter(moment().format('MMM Do YYYY | HH:mm:ss'));

					return modLogs !== null
						? modLogs.send({'embed': warnEmbed})
						: msg.reply('📃 I can keep a log of warning points given if you create a channel named \'mod-logs\' and give me access to it');
				});
			} else {
				if (!obj[args.member.id]) {
					obj[args.member.id] = {
						'usertag': args.member.user.tag,
						'points': args.points
					};
				} else {
					warnpoints = obj[args.member.id].points;
					obj[args.member.id].points = warnpoints + args.points;
				}

				jsonfile.writeFile(path.join(__dirname, `data/${msg.guild.id}/warnlog.json`), obj, (writeFileErr) => {
					if (writeFileErr) {
						return msg.reply(oneLine `⚠️ An error occured writing the warning to disc and the error has been logged on Favna\'s end.
						You can contact my developer on his server. Use \`${msg.guild.commandPrefix}invite\` to get an invite to his server.`);
					}

					warnEmbed
						.setColor('#FFFF00')
						.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
						.setDescription(`**Member:** ${args.member.user.tag} (${args.member.id})\n` +
							'**Action:** Warn\n' +
							`**Previous Warning Points:** ${warnpoints}\n` +
							`**Current Warning Points:** ${warnpoints + args.points}\n` +
							`**Reason:** ${args.reason !== '' ? args.reason : 'No reason has been added by the moderator'}`)
						.setFooter(moment().format('MMM Do YYYY | HH:mm:ss'));

					return modLogs !== null
						? modLogs.send({'embed': warnEmbed})
						: msg.reply(oneLine `📃 📃 I can keep a log of warning points given if you create a channel named 'mod-logs' and give me access to it. 
						Alternatively use the ${msg.guild.commandPrefix}listwarn command to view the current warning points for a given member`);
				});
			}
		});
	}
};