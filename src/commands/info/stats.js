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
	duration = require('moment-duration-format'), // eslint-disable-line no-unused-vars
	moment = require('moment'),
	{oneLine} = require('common-tags'),
	process = require('process');

module.exports = class statsCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'stats',
			'memberName': 'stats',
			'group': 'info',
			'aliases': ['botinfo', 'info'],
			'description': 'Gets statistics about Ribbon',
			'examples': ['stats'],
			'guildOnly': false,
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

	fetchPlatform (plat) {
		switch (plat) {
			case 'win32':
				return 'Windows';
			case 'darwin':
				return 'MacOS';
			default:
				return 'Linux';
		}
	}

	run (msg) {
		const statsEmbed = new Discord.MessageEmbed();

		statsEmbed
			.setColor('#E24141')
			.setAuthor('Ribbon Bot Stats', 'https://ribbon.favna.xyz/images/ribbon.png')
			.addField('Guilds', this.client.guilds.size, true)
			.addField('Channels', this.client.channels.size, true)
			.addField('Users', this.client.users.size, true)
			.addField('Owner', 'Favna#2846', true)
			.addField('License', 'GPL-3.0 + 7b & 7c', true)
			.addField('Discord.JS', '12.0', true)
			.addField('NodeJS', process.version, true)
			.addField('Platform', this.fetchPlatform(process.platform.toLowerCase()), true)
			.addField('Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 10485.76) / 100} MB`, true)
			.addField('Invite Me', '[Click Here](https://discord.now.sh/376520643862331396?p8)', true)
			.addField('Source', '[Available on GitHub](https://github.com/favna/ribbon)', true)
			.addField('Support', '[Server Invite](https://discord.gg/zdt5yQt)', true)
			.addField('Uptime', moment.duration(this.client.uptime).format('DD [days], HH [hours and] mm [minutes]'))
			.addField('Current server time', moment().format('MMMM Do YYYY [|] HH:mm.ss [UTC]ZZ'))
			.addField('\u200b', oneLine `Use the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}help\` command to get the list of commands available to you in a DM. 
            The default prefix is \`!\`. You can change this with the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}prefix\` command. 
            If you ever forget the command prefix, just use \`${this.client.user.tag} prefix\``)
			.setFooter(`Ribbon | ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`, 'https://ribbon.favna.xyz/images/ribbon.png');

		this.deleteCommandMessages(msg);

		return msg.embed(statsEmbed);
	}
};