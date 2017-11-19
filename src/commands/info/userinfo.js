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

const capitalize = function (string) { // eslint-disable-line one-var
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	},
	data = {
		'status': {
			'online': 'Online',
			'idle': 'Idle',
			'dnd': 'Do Not Disturb',
			'invisible': 'Invisible'
		}
	};

module.exports = class userInfoCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'userinfo',
			'aliases': ['user', 'uinfo'],
			'group': 'info',
			'memberName': 'userinfo',
			'description': 'Gets information about a user.',
			'examples': ['uinfo {user}', 'uinfo Favna'],
			'guildOnly': true,
			'throttling': {
				'usages': 1,
				'duration': 60
			},

			'args': [
				{
					'key': 'member',
					'prompt': 'What user would you like to snoop on?',
					'type': 'member',
					'label': 'member name or ID'
				}
			]
		});
	}

	run (msg, args) {

		const uinfoEmbed = new Discord.MessageEmbed(),
			vals = {
				'member': args.member,
				'user': args.member.user
			};

		uinfoEmbed
			.setAuthor(vals.user.tag)
			.setImage(vals.user.displayAvatarURL())
			.setColor(vals.member.displayHexColor)
			.addField('ID', vals.user.id, true)
			.addField('Name', vals.user.username, true)
			.addField('Nickname', vals.member.nickname !== null ? vals.member.nickname : 'No Nickname', true)
			.addField('Status', data.status[vals.user.presence.status], true)
			.addField(vals.user.presence.activity !== null
				? capitalize(vals.user.presence.activity.type)
				: 'Activity', vals.user.presence.activity !== null ? vals.user.presence.activity.name : 'Nothing', true)
			.addField('Display Color', vals.member.displayHexColor, true)
			.addField('Account created at', moment(vals.user.createdAt).format('MMMM Do YYYY'), true)
			.addField('Joined server at', moment(vals.member.joinedAt).format('MMMM Do YYYY'), true)
			.addField('Roles', vals.member.roles.size > 1 ? vals.member.roles.map(r => r.name).slice(1) : 'None', true);
		vals.member.roles.size >= 1 ? uinfoEmbed.setFooter(`has ${vals.member.roles.size - 1} role(s)`) : uinfoEmbed.setFooter('has 0 roles');

		msg.embed(uinfoEmbed);
	}
};