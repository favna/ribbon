/**
 * @file Extra MoneyCommand - Convert one currency to another  
 * Note: bitcoin is BTC, Ethereum is ETH, Litecoin is LTC  
 * For a full list of supported currencies see [this url](https://docs.openexchangerates.org/docs/supported-currencies)  
 * **Aliases**: `money`, `rate`, `convert`
 * @module
 * @category extra
 * @name oxr
 * @example oxr 1 EUR USD
 * @param {Number} MoneyAmount Amount of money to convert
 * @param {StringResolvable} OriginCurrency Currency to convert from
 * @param {StringResolvable} TargetCurrency Currency to convert to
 * @returns {MessageEmbed} Input and output currency's and the amount your input is worth in both
 */

const currencySymbol = require('currency-symbol-map'),
  fetch = require('node-fetch'),
  fx = require('money'),
  moment = require('moment'),
  querystring = require('querystring'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

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
          type: 'string',
          parse: p => p.replace(/,/gm, '.')
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

  async run (msg, {value, curOne, curTwo}) {
    try {
      startTyping(msg);

      /* eslint-disable camelcase*/
      const oxrEmbed = new MessageEmbed(),
        res = await fetch(`https://openexchangerates.org/api/latest.json?${querystring.stringify({
          app_id: process.env.oxrkey,
          prettyprint: false,
          show_alternative: true
        })}`),
        exchangeData = await res.json();
      /* eslint-enable camelcase*/

      fx.rates = exchangeData.rates;
      fx.base = exchangeData.body;

      oxrEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setAuthor('🌐 Currency Converter')
        .addField(`:flag_${curOne.slice(0, 2).toLowerCase()}: Money in ${curOne}`, `${currencySymbol(curOne) ? currencySymbol(curOne) : ''}${value}`, true)
        .addField(`:flag_${curTwo.slice(0, 2).toLowerCase()}: Money in ${curTwo}`, `${currencySymbol(curTwo) ? currencySymbol(curOne) : ''}${this.converter(value, curOne, curTwo)}`, true)
        .setTimestamp();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(oxrEmbed);
    } catch (err) {
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
  }
};