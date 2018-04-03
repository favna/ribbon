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

/**
 * @file Extra MoneyCommand - Convert one currency to another  
 * Note: bitcoin is BTC, Ethereum is ETH, Litecoin is LTC  
 * For a full list of supported currencies see [this url](https://docs.openexchangerates.org/docs/supported-currencies)  
 * **Aliases**: `money`, `rate`, `convert`
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @license GPL-3.0-or-later
 * @module
 * @category extra
 * @name oxr
 * @example ox 1 EUR USD
 * @param {number} MoneyAmount Amount of money to convert
 * @param {string} OriginCurrency Currency to convert from
 * @param {string} TargetCurrency Currency to convert to
 * @returns {MessageEmbed} Input and output currency's and the amount your input is worth in both
 */

const {MessageEmbed} = require('discord.js'),
  commando = require('discord.js-commando'),
  currencySymbol = require('currency-symbol-map'),
  fx = require('money'),
  moment = require('moment'),
  request = require('snekfetch'), 
  {deleteCommandMessages} = require('../../util.js'), 
  {oxrAppID} = require('../../auth.json'), 
  {stripIndents} = require('common-tags');

module.exports = class MoneyCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'oxr',
      'memberName': 'oxr',
      'group': 'extra',
      'aliases': ['money', 'rate', 'convert'],
      'description': 'Currency converter - makes use of ISO 4217 standard currency codes (see list here: <https://docs.openexchangerates.org/docs/supported-currencies>)',
      'format': 'CurrencyAmount FirstValuta SecondValuta',
      'examples': ['convert 50 USD EUR'],
      'guildOnly': false,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'value',
          'prompt': 'Amount of money?',
          'type': 'string'
        },
        {
          'key': 'curOne',
          'prompt': 'What is the valuta you want to convert **from**?',
          'type': 'string'
        },
        {
          'key': 'curTwo',
          'prompt': 'What is the valuta you want to convert **to**?',
          'type': 'string'
        }
      ]
    });
  }


  converter (value, curOne, curTwo) {
    return fx.convert(value, {
      'from': curOne,
      'to': curTwo
    });
  }

  replaceAll (string, pattern, replacement) {
    return string.replace(new RegExp(pattern, 'g'), replacement);
  }
  /* eslint-disable multiline-comment-style, capitalized-comments, line-comment-position*/

  async run (msg, args) {
    const rates = await request.get('https://openexchangerates.org/api/latest.json')
      .query('app_id', oxrAppID)
      .query('prettyprint', false)
      .query('show_alternative', true);

    if (rates.ok) {
      fx.rates = rates.body.rates;
      fx.base = rates.body.base;

      const convertedMoney = this.converter(this.replaceAll(args.value, /,/, '.'), args.curOne, args.curTwo),
        oxrEmbed = new MessageEmbed();

      oxrEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
        .setAuthor('🌐 Currency Converter')
        .addField(`:flag_${args.curOne.slice(0, 2).toLowerCase()}: Money in ${args.curOne}`, `${currencySymbol(args.curOne)}${this.replaceAll(args.value, /,/, '.')}`, true)
        .addField(`:flag_${args.curTwo.slice(0, 2).toLowerCase()}: Money in ${args.curTwo}`, `${currencySymbol(args.curTwo)}${convertedMoney}`, true)
        .setFooter(`Converted on ${moment.unix(rates.body.timestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`);

      deleteCommandMessages(msg, this.client);

      return msg.embed(oxrEmbed);
    }

    console.error(`${stripIndents `An error occured on the oxr command!
		Server: ${msg.guild.name} (${msg.guild.id})
		Author: ${msg.author.tag} (${msg.author.id})
		Time: ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		Error Message:`} ${rates.statusText}`);

    return msg.reply('⚠️ an error occurred. Make sure you used supported currency names. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>');
  }
};