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
	weather = require('yahoo-weather');

const convertTimeFormat = function (input) { // eslint-disable-line one-var
		const ampm = input.match(/\s(.*)$/)[1],
			minutes = Number(input.match(/:(\d+)/)[1]);
		let hours = Number(input.match(/^(\d+)/)[1]),
			sHours = hours.toString(),
			sMinutes = minutes.toString();


		if (ampm === 'pm' && hours < 12) {
			hours += 12;
		}
		if (ampm === 'am' && hours === 12) {
			hours -= 12;
		}

		if (hours < 10) {
			sHours = `0${sHours}`;
		}
		if (minutes < 10) {
			sMinutes = `0${sMinutes}`;
		}

		return `${sHours}:${sMinutes}`;
	},
	data = {
		'Mon': 'Monday',
		'Tue': 'Tuesday',
		'Wed': 'Wednesday',
		'Thu': 'Thursday',
		'Fri': 'Friday',
		'Sat': 'Saturday',
		'Sun': 'Sunday'
	};

module.exports = class weatherCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'weather',
			'group': 'info',
			'aliases': ['temp'],
			'memberName': 'weather',
			'description': 'Get the weather in a city',
			'examples': ['weather {city}', 'weather amsterdam'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'city',
					'prompt': 'Weather in which city?',
					'type': 'string',
					'label': 'City to get weather from'
				}
			]
		});
	}

	run (msg, args) {
		weather(args.city).then((info) => {
			const wthEmb = new Discord.MessageEmbed();

			wthEmb
				.setAuthor(`Weather data for ${info.location.city} - ${info.location.country}`)
				.setFooter(`Weather data pulled from ${info.image.title} at ${moment().format('MMMM Do YYYY | HH:mm')}`)
				.setThumbnail(info.item.description.slice(19, 56))
				.setColor('#E24141')
				.addField('💨 Wind Speed', `${info.wind.speed} ${info.units.speed}`, true)
				.addField('💧 Humidity', `${info.atmosphere.humidity}%`, true)
				.addField('🌅 Sunrise', convertTimeFormat(info.astronomy.sunrise), true)
				.addField('🌇 Sunset', convertTimeFormat(info.astronomy.sunset), true)
				.addField('☀️ Today\'s High', `${info.item.forecast[0].high} °${info.units.temperature}`, true)
				.addField('☁️️ Today\'s Low', `${info.item.forecast[0].low} °${info.units.temperature}`, true)
				.addField('🌡️ Temperature', `${info.item.condition.temp} °${info.units.temperature}`, true)
				.addField('🏙️ Condition', info.item.condition.text, true)
				.addField(`🛰️ Forecast ${data[info.item.forecast[1].day]} ${info.item.forecast[1].date.slice(0, -5)}`,
					`High: ${info.item.forecast[1].high} °${info.units.temperature} | Low: ${info.item.forecast[1].low} °${info.units.temperature}`, true)
				.addField(`🛰️ Forecast ${data[info.item.forecast[2].day]} ${info.item.forecast[2].date.slice(0, -5)}`,
					`High: ${info.item.forecast[2].high} °${info.units.temperature} | Low: ${info.item.forecast[2].low} °${info.units.temperature}`, true);

			return msg.embed(wthEmb);
		});
	}
};