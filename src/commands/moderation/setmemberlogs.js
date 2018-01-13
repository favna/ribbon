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

const commando = require('discord.js-commando'),
	{oneLine} = require('common-tags');

module.exports = class setMemberlogsCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'setmemberlogs',
			'group': 'moderation',
			'aliases': ['setmember'],
			'memberName': 'setmemberlogs',
			'description': 'Set the memberlogs channel used for logging member logs (such as people joining and leaving). Ensure to enable memberlogs with the "memberlogs" command.',
			'examples': ['setmemberlogs {channel ID or channel Name (partial or full)}', 'setmemberlogs member-logs'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'channel',
					'prompt': 'What channel should I set for member logs? (make sure to start with a # when going by name)',
					'type': 'channel',
					'label': 'Channel for moderator logs'
				}
			]
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	hasPermission (msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
	}

	run (msg, args) {
		this.client.provider.set(msg.guild.id, 'memberlogchannel', args.channel.id);
		this.deleteCommandMessages(msg);

		return msg.reply(oneLine `the channel to use for the member logging has been set to ${msg.guild.channels.get(this.client.provider.get(msg.guild.id, 'memberlogchannel')).name}`);
	}
};