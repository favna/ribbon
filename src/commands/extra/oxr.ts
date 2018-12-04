/**
 * @file Extra MoneyCommand - Convert one currency to another
 *
 * Note: bitcoin is BTC, Ethereum is ETH, Litecoin is LTC
 *
 * For a full list of supported currencies see [this url](https://docs.openexchangerates.org/docs/supported-currencies)
 *
 * **Aliases**: `money`, `rate`, `convert`
 * @module
 * @category extra
 * @name oxr
 * @example oxr 1 EUR USD
 * @param {Number} MoneyAmount Amount of money to convert
 * @param {StringResolvable} OriginCurrency Currency to convert from
 * @param {StringResolvable} TargetCurrency Currency to convert to
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import fetch from 'node-fetch';
import {
    convert,
    currencymap,
    deleteCommandMessages,
    startTyping,
    stopTyping,
    stringify,
} from '../../components';

export default class MoneyCommand extends Command {
    private validCurs = [
        'AED',
        'AFN',
        'ALL',
        'AMD',
        'ANG',
        'AOA',
        'ARS',
        'AUD',
        'AWG',
        'AZN',
        'BAM',
        'BBD',
        'BDT',
        'BGN',
        'BHD',
        'BIF',
        'BMD',
        'BND',
        'BOB',
        'BRL',
        'BSD',
        'BTC',
        'BTN',
        'BTS',
        'BWP',
        'BYN',
        'BZD',
        'CAD',
        'CDF',
        'CHF',
        'CLF',
        'CLP',
        'CNH',
        'CNY',
        'COP',
        'CRC',
        'CUC',
        'CUP',
        'CVE',
        'CZK',
        'DASH',
        'DJF',
        'DKK',
        'DOGE',
        'DOP',
        'DZD',
        'EAC',
        'EGP',
        'EMC',
        'ERN',
        'ETB',
        'ETH',
        'EUR',
        'FCT',
        'FJD',
        'FKP',
        'FTC',
        'GBP',
        'GEL',
        'GGP',
        'GHS',
        'GIP',
        'GMD',
        'GNF',
        'GTQ',
        'GYD',
        'HKD',
        'HNL',
        'HRK',
        'HTG',
        'HUF',
        'IDR',
        'ILS',
        'IMP',
        'INR',
        'IQD',
        'IRR',
        'ISK',
        'JEP',
        'JMD',
        'JOD',
        'JPY',
        'KES',
        'KGS',
        'KHR',
        'KMF',
        'KPW',
        'KRW',
        'KWD',
        'KYD',
        'KZT',
        'LAK',
        'LBP',
        'LD',
        'LKR',
        'LRD',
        'LSL',
        'LTC',
        'LYD',
        'MAD',
        'MDL',
        'MGA',
        'MKD',
        'MMK',
        'MNT',
        'MOP',
        'MRO',
        'MRU',
        'MUR',
        'MVR',
        'MWK',
        'MXN',
        'MYR',
        'MZN',
        'NAD',
        'NGN',
        'NIO',
        'NMC',
        'NOK',
        'NPR',
        'NVC',
        'NXT',
        'NZD',
        'OMR',
        'PAB',
        'PEN',
        'PGK',
        'PHP',
        'PKR',
        'PLN',
        'PPC',
        'PYG',
        'QAR',
        'RON',
        'RSD',
        'RUB',
        'RWF',
        'SAR',
        'SBD',
        'SCR',
        'SDG',
        'SEK',
        'SGD',
        'SHP',
        'SLL',
        'SOS',
        'SRD',
        'SSP',
        'STD',
        'STN',
        'STR',
        'SVC',
        'SYP',
        'SZL',
        'THB',
        'TJS',
        'TMT',
        'TND',
        'TOP',
        'TRY',
        'TTD',
        'TWD',
        'TZS',
        'UAH',
        'UGX',
        'USD',
        'UYU',
        'UZS',
        'VEF',
        'VEF_BLKMKT',
        'VEF_DICOM',
        'VEF_DIPRO',
        'VND',
        'VTC',
        'VUV',
        'WST',
        'XAF',
        'XAG',
        'XAU',
        'XCD',
        'XDR',
        'XMR',
        'XOF',
        'XPD',
        'XPF',
        'XPM',
        'XPT',
        'XRP',
        'YER',
        'ZAR',
        'ZMW',
        'ZWL',
    ];

    constructor(client: CommandoClient) {
        super(client, {
            name: 'oxr',
            aliases: ['money', 'rate', 'convert'],
            group: 'extra',
            memberName: 'oxr',
            description:
                'Currency converter - makes use of ISO 4217 standard currency codes (see list here: <https://docs.openexchangerates.org/docs/supported-currencies>)',
            format: 'CurrencyAmount FirstValuta SecondValuta',
            examples: ['convert 50 USD EUR'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'value',
                    prompt: 'Amount of money?',
                    type: 'float',
                },
                {
                    key: 'fromCurrency',
                    prompt: 'What is the valuta you want to convert **from**?',
                    type: 'string',
                    validate: (curs: string) => {
                        if (this.validCurs.includes(curs.toUpperCase())) {
                            return true;
                        }

                        return 'Respond with a supported currency. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>';
                    },
                    parse: (p: string) => p.toUpperCase(),
                },
                {
                    key: 'toCurrency',
                    prompt: 'What is the valuta you want to convert **to**?',
                    type: 'string',
                    validate: (curs: string) => {
                        if (this.validCurs.includes(curs.toUpperCase())) {
                            return true;
                        }

                        return 'Respond with a supported currency. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>';
                    },
                    parse: (p: string) => p.toUpperCase(),
                },
            ],
        });
    }

    public async run(
        msg: CommandoMessage,
        {
            value,
            fromCurrency,
            toCurrency,
        }: { value: number; fromCurrency: string; toCurrency: string }
    ) {
        try {
            startTyping(msg);

            const oxrEmbed = new MessageEmbed();
            const request = await fetch(
                `https://openexchangerates.org/api/latest.json?${stringify({
                    app_id: process.env.OXR_API_KEY,
                    prettyprint: false,
                    show_alternative: true,
                })}`
            );
            const response = await request.json();
            const result = convert(
                response.rates,
                fromCurrency,
                toCurrency,
                value
            );

            oxrEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
                .setAuthor('🌐 Currency Converter')
                .addField(
                    `:flag_${fromCurrency
                        .slice(0, 2)
                        .toLowerCase()}: Money in ${fromCurrency}`,
                    `${
                        currencymap(fromCurrency)
                            ? currencymap(fromCurrency)
                            : ''
                    }${value}`,
                    true
                )
                .addField(
                    `:flag_${toCurrency
                        .slice(0, 2)
                        .toLowerCase()}: Money in ${toCurrency}`,
                    `${
                        currencymap(toCurrency) ? currencymap(toCurrency) : ''
                    }${result}`,
                    true
                )
                .setTimestamp();

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(oxrEmbed);
        } catch (err) {
            stopTyping(msg);
            const channel = this.client.channels.get(
                process.env.ISSUE_LOG_CHANNEL_ID
            ) as TextChannel;

            channel.send(stripIndents`
                <@${
                    this.client.owners[0].id
                }> Error occurred in \`oxr\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format(
                    'MMMM Do YYYY [at] HH:mm:ss [UTC]Z'
                )}
                **Input:** \`${value}\` || \`${fromCurrency}\` || \`${toCurrency}\`
            `);

            return msg.reply(
                'an error occurred. Make sure you used supported currency names. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>'
            );
        }
    }
}
