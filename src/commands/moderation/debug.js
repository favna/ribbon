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
	commando = require('discord.js-commando');

module.exports = class debugCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'debug',
			'aliases': ['bug'],
			'group': 'info',
			'memberName': 'debug',
			'description': 'Gets the channel or role names and their matching IDs on a server',
			'examples': ['debug {bugType}', 'debug roles'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 10
			},

			'args': [
				{
					'key': 'buggerType',
					'prompt': 'Do you want to debug `channels` or `roles`?',
					'type': 'string',
					'label': 'channels or roles to debug'
				}
			]
		});
	}

	hasPermission (msg) {
		return msg.member.hasPermission('ADMINISTRATOR');
	}

	run (msg, args) {
		const bugger = args.buggerType,
			debugEmbed = new Discord.MessageEmbed();

		debugEmbed
			.setColor('#FF0000')
			.setTitle(`The ${bugger} on this server are as follows`);

		switch (bugger) {
			case 'channels':
			{
				const chanIDs = msg.guild.channels.filter(textFilter => textFilter.type === 'text').map(cid => cid.id),
					chanNames = msg.guild.channels.filter(textFilter => textFilter.type === 'text').map(cn => cn.name);

				debugEmbed
					.addField('Channel name', chanNames, true)
					.addBlankField(true)
					.addField('channel ID', chanIDs, true);
				break;
			}
			case 'roles':
			{
				const roleIDs = msg.guild.roles.map(rid => rid.id),
					roleNames = msg.guild.roles.map(rn => rn.name).slice(1);

				roleNames.unshift('Everyone');
				debugEmbed
					.addField('Role name', roleNames, true)
					.addBlankField(true)
					.addField('Role ID', roleIDs, true);
				break;
			}
			default:
			{
				return msg.reply('That is not a valid debugger option. Either `channels` or `roles`');
			}
		}

		return msg.embed(debugEmbed);
	}
};