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
	auth = require('../../auth.json'),
	commando = require('discord.js-commando'),
	currencySymbol = require('currency-symbol-map'),
	fx = require('money'),
	moment = require('moment'),
	oxr = require('open-exchange-rates');

const converter = function (value, curOne, curTwo) { // eslint-disable-line one-var
		return fx.convert(value, {
			'from': curOne,
			'to': curTwo
		});
	},
	replaceAll = function (string, pattern, replacement) {
		return string.replace(new RegExp(pattern, 'g'), replacement);
	};

oxr.set({'app_id': auth.oxrAppID});

module.exports = class moneyCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'oxr',
			'group': 'info',
			'aliases': ['money', 'rate', 'convert'],
			'memberName': 'oxr',
			'description': 'Currency converter - makes use of ISO 4217 standard currency codes (see list here: <https://docs.openexchangerates.org/docs/supported-currencies>)',
			'examples': ['oxr {amount} {currency_1} {currency_2}', 'convert 50 USD EUR'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},

			'args': [
				{
					'key': 'value',
					'prompt': 'Amount of money?',
					'type': 'string',
					'label': 'Amount to convert'
				},
				{
					'key': 'curOne',
					'prompt': 'What is the currency you want to convert **from**?',
					'type': 'string',
					'label': 'First Currency'
				},
				{
					'key': 'curTwo',
					'prompt': 'What is the currency you want to convert **to**?',
					'type': 'string',
					'label': 'Second Currency'
				}
			]
		});
	}

	run (msg, args) {
		oxr.latest(async () => {
			try {
				fx.rates = oxr.rates;
				fx.base = oxr.base;
				const convertedMoney = await converter(replaceAll(args.value, /,/, '.'), args.curOne, args.curTwo),
					oxrEmbed = new Discord.MessageEmbed();

				oxrEmbed
					.setColor('#E24141')
					.setAuthor('🌐 Currency Converter')
					.addField(args.curOne !== 'BTC'
						? `:flag_${args.curOne.slice(0, 2).toLowerCase()}: Money in ${args.curOne}`
						: '💰 Money in Bitcoin',
					`${currencySymbol(args.curOne)}${replaceAll(args.value, /,/, '.')}`, true)

					.addField(args.curTwo !== 'BTC'
						? `:flag_${args.curTwo.slice(0, 2).toLowerCase()}: Money in ${args.curTwo}`
						: '💰 Money in Bitcoin',
					`${currencySymbol(args.curTwo)}${convertedMoney}`, true)
					.setFooter(`Converted money from input using openexchangerates | converted on: ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`);

				return msg.embed(oxrEmbed);
			} catch (error) {
				console.error(error); // eslint-disable-line no-console

				return msg.reply('⚠️ An error occurred. Make sure you used supported currency names. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>');
			}
		});
	}
};