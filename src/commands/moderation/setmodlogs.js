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

module.exports = class setModlogsCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'setmodlogs',
			'group': 'moderation',
			'aliases': ['setmod'],
			'memberName': 'setmodlogs',
			'description': 'Set the modlogs channel used for logging mod commands. Ensure to enable modlogs with the "modlogs" command.',
			'examples': ['setmodlogs {channel ID or channel Name (partial or full)}', 'setmodlogs mod-logs'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'channel',
					'prompt': 'Channel to use for modlogs? (make sure to start with a # when going by name)',
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
		this.client.provider.set(msg.guild.id, 'modlogchannel', args.channel.id);
		this.deleteCommandMessages(msg);

		return msg.reply(oneLine `the channel to use for the moderation logging has been set to ${msg.guild.channels.get(this.client.provider.get(msg.guild.id, 'modlogchannel')).name}`);
	}
};