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
	moment = require('moment'),
	{oneLine} = require('common-tags');

module.exports = class sayWutCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'saywut',
			'aliases': ['saywat', 'saywot'],
			'group': 'misc',
			'memberName': 'saywut',
			'description': 'Bust the last "say" user',
			'examples': ['saywut'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			}
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	run (msg) {
		const saydata = this.client.provider.get(msg.guild.id, 'saydata', null),
			wutEmbed = new Discord.MessageEmbed();

		if (saydata) {
			wutEmbed
				.setColor(saydata.memberHexColor)
				.setTitle(`Last ${saydata.commandPrefix}say message author`)
				.setAuthor(oneLine `${saydata.authorTag} (${saydata.authorID})`, saydata.avatarURL)
				.setFooter(oneLine `${moment(saydata.messageDate).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`, 'https://favna.s-ul.eu/0wDHYIRn.png')
				.setDescription(saydata.argString);

			this.deleteCommandMessages(msg);

			return msg.embed(wutEmbed);
		}

		this.deleteCommandMessages(msg);

		return msg.reply(`couldn't fetch message for your server. Has anyone used the ${msg.guild.commandPrefix}say command before?`);
	}
};