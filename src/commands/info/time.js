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
	request = require('snekfetch'),
	{MessageEmbed} = require('discord.js'),
	{oneLine, stripIndents} = require('common-tags'),
	{deleteCommandMessages} = require('../../util.js'),
	{timezonedbkey, googleapikey} = require('../../auth.json');

module.exports = class timeCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'time',
			'memberName': 'time',
			'group': 'info',
			'aliases': ['citytime'],
			'description': 'Gets the time in any given city',
			'format': 'CityName',
			'examples': ['time London'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'city',
					'prompt': 'Get time in which city?',
					'type': 'string'
				}
			]
		});
	}

	async getCords (city) {
		const cords = await request.get('https://maps.googleapis.com/maps/api/geocode/json?')
			.query('address', city)
			.query('key', googleapikey);

		if (cords.ok) {
			return [cords.body.results[0].geometry.location.lat, cords.body.results[0].geometry.location.lng];
		}

		return null;
	}

	async run (msg, args) {
		const cords = await this.getCords(args.city);

		if (cords) {
			const time = await request.get('http://api.timezonedb.com/v2/get-time-zone')
				.query('key', timezonedbkey)
				.query('format', 'json')
				.query('by', 'position')
				.query('lat', cords[0])
				.query('lng', cords[1]);

			if (time.ok) {
				const timeArr = time.body.formatted.split(' '),
					timeEmbed = new MessageEmbed();

				timeEmbed
					.setTitle(`:flag_${time.body.countryCode.toLowerCase()}: ${args.city}`)
					.setDescription(stripIndents `**Current Time:** ${timeArr[1]}
					**Current Date:** ${timeArr[0]}
					**Country:** ${time.body.countryName}
					**DST:** ${time.body.dst}`)
					.setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2');

				deleteCommandMessages(msg, this.client);

				return msg.embed(timeEmbed);
			}
		}

		console.error(stripIndents `Time fetching command failed due to mismatched city
						City: ${args.city}
						Server: ${msg.guild.name} (${msg.guild.id})
						Author: ${msg.author.tag} (${msg.author.id})`);

		return msg.reply(oneLine `Couldn\'t find that city, are you sure you spelled it correctly?
		A log has been made for Favna so if you want to you can notify him on his server.
		Use \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}invite\` to get a link to the support server.`);
	}
};