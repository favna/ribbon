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
 * @param {number} MoneyAmount Amount of money to convert
 * @param {string} OriginCurrency Currency to convert from
 * @param {string} TargetCurrency Currency to convert to
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as moment from 'moment';
import fetch from 'node-fetch';
import { convert, currencymap, deleteCommandMessages, startTyping, stopTyping, stringify, validCurrenciesMap } from '../../components';

export default class MoneyCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'oxr',
            aliases: ['money', 'rate', 'convert'],
            group: 'extra',
            memberName: 'oxr',
            description: 'Currency converter - makes use of ISO 4217 standard currency codes (see list here: <https://docs.openexchangerates.org/docs/supported-currencies>)',
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
                    validate: (curs: string) => validCurrenciesMap.includes(curs.toUpperCase())
                        ? true
                        : 'Respond with a supported currency. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>',
                    parse: (p: string) => p.toUpperCase(),
                },
                {
                    key: 'toCurrency',
                    prompt: 'What is the valuta you want to convert **to**?',
                    type: 'string',
                    validate: (curs: string) => validCurrenciesMap.includes(curs.toUpperCase())
                        ? true
                        : 'Respond with a supported currency. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>',
                    parse: (p: string) => p.toUpperCase(),
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { value, fromCurrency, toCurrency }: { value: number; fromCurrency: string; toCurrency: string }) {
        try {
            startTyping(msg);

            const oxrEmbed = new MessageEmbed();
            const request = await fetch(`https://openexchangerates.org/api/latest.json?${stringify({
                    app_id: process.env.OXR_API_KEY,
                    prettyprint: false,
                    show_alternative: true,
                })}`
            );
            const response = await request.json();
            const result = convert(response.rates, fromCurrency, toCurrency, value);

            oxrEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : process.env.DEFAULT_EMBED_COLOR)
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
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`oxr\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** \`${value}\` || \`${fromCurrency}\` || \`${toCurrency}\`
            `);

            return msg.reply(
                'an error occurred. Make sure you used supported currency names. See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>'
            );
        }
    }
}
