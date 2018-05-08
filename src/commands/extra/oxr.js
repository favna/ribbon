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
 * @module
 * @category extra
 * @name oxr
 * @example ox 1 EUR USD
 * @param {number} MoneyAmount Amount of money to convert
 * @param {string} OriginCurrency Currency to convert from
 * @param {string} TargetCurrency Currency to convert to
 * @returns {MessageEmbed} Input and output currency's and the amount your input is worth in both
 */

const currencySymbol = require('currency-symbol-map'),
  fx = require('money'),
  moment = require('moment'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class MoneyCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'oxr',
      memberName: 'oxr',
      group: 'extra',
      aliases: ['money', 'rate', 'convert'],
      description: 'Currency converter - makes use of ISO 4217 standard currency codes (see list here: <https://docs.openexchangerates.org/docs/supported-currencies>)',
      format: 'CurrencyAmount FirstValuta SecondValuta',
      examples: ['convert 50 USD EUR'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'value',
          prompt: 'Amount of money?',
          type: 'string'
        },
        {
          key: 'curOne',
          prompt: 'What is the valuta you want to convert **from**?',
          type: 'string',
          validate: (curs) => {
            const validCurs = [
              'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTC', 'BTN', 'BTS',
              'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLF', 'CLP', 'CNH', 'CNY', 'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DASH', 'DJF', 'DKK', 'DOGE', 'DOP', 'DZD', 'EAC', 'EGP', 'EMC', 'ERN',
              'ETB', 'ETH', 'EUR', 'FCT', 'FJD', 'FKP', 'FTC', 'GBP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD',
              'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LD', 'LKR', 'LRD', 'LSL', 'LTC', 'LYD', 'MAD', 'MDL', 'MGA',
              'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NMC', 'NOK', 'NPR', 'NVC', 'NXT', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP',
              'PKR', 'PLN', 'PPC', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STD', 'STN', 'STR', 'SVC', 'SYP', 'SZL',
              'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VEF', 'VEF_BLKMKT', 'VEF_DICOM', 'VEF_DIPRO', 'VND', 'VTC', 'VUV', 'WST', 'XAF', 'XAG',
              'XAU', 'XCD', 'XDR', 'XMR', 'XOF', 'XPD', 'XPF', 'XPM', 'XPT', 'XRP', 'YER', 'ZAR', 'ZMW', 'ZWL'
            ];

            if (validCurs.includes(curs.toUpperCase())) {
              return true;
            }

            return 'Respond with a supported currency. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>';
          },
          parse: p => p.toUpperCase()
        },
        {
          key: 'curTwo',
          prompt: 'What is the valuta you want to convert **to**?',
          type: 'string',
          validate: (curs) => {
            const validCurs = [
              'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTC', 'BTN', 'BTS',
              'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLF', 'CLP', 'CNH', 'CNY', 'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DASH', 'DJF', 'DKK', 'DOGE', 'DOP', 'DZD', 'EAC', 'EGP', 'EMC', 'ERN',
              'ETB', 'ETH', 'EUR', 'FCT', 'FJD', 'FKP', 'FTC', 'GBP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD',
              'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LD', 'LKR', 'LRD', 'LSL', 'LTC', 'LYD', 'MAD', 'MDL', 'MGA',
              'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NMC', 'NOK', 'NPR', 'NVC', 'NXT', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP',
              'PKR', 'PLN', 'PPC', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STD', 'STN', 'STR', 'SVC', 'SYP', 'SZL',
              'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VEF', 'VEF_BLKMKT', 'VEF_DICOM', 'VEF_DIPRO', 'VND', 'VTC', 'VUV', 'WST', 'XAF', 'XAG',
              'XAU', 'XCD', 'XDR', 'XMR', 'XOF', 'XPD', 'XPF', 'XPM', 'XPT', 'XRP', 'YER', 'ZAR', 'ZMW', 'ZWL'
            ];

            if (validCurs.includes(curs.toUpperCase())) {
              return true;
            }

            return 'Respond with a supported currency. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>';
          },
          parse: p => p.toUpperCase()
        }
      ]
    });
  }


  converter (value, curOne, curTwo) {
    return fx.convert(value, {
      from: curOne,
      to: curTwo
    });
  }

  replaceAll (string, pattern, replacement) {
    return string.replace(new RegExp(pattern, 'g'), replacement);
  }

  async run (msg, {value, curOne, curTwo}) {
    startTyping(msg);
    const rates = await request.get('https://openexchangerates.org/api/latest.json')
      .query('app_id', process.env.oxrkey)
      .query('prettyprint', false)
      .query('show_alternative', true);

    if (rates.ok) {
      fx.rates = rates.body.rates;
      fx.base = rates.body.base;

      const convertedMoney = this.converter(this.replaceAll(value, /,/, '.'), curOne, curTwo),
        oxrEmbed = new MessageEmbed();

      oxrEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setAuthor('🌐 Currency Converter')
        .addField(`:flag_${curOne.slice(0, 2).toLowerCase()}: Money in ${curOne}`, `${currencySymbol(curOne)}${this.replaceAll(value, /,/, '.')}`, true)
        .addField(`:flag_${curTwo.slice(0, 2).toLowerCase()}: Money in ${curTwo}`, `${currencySymbol(curTwo)}${convertedMoney}`, true)
        .setTimestamp();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(oxrEmbed);
    }
    stopTyping(msg);
    this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
    <@${this.client.owners[0].id}> Error occurred in \`oxr\` command!
    **Server:** ${msg.guild.name} (${msg.guild.id})
    **Author:** ${msg.author.tag} (${msg.author.id})
    **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
    **Input:** \`${value}\` || \`${curOne}\` || \`${curTwo}\`
    `);

    return msg.reply('an error occurred. Make sure you used supported currency names. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>');
  }
};