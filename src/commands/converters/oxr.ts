/**
 * @file Converters MoneyCommand - Convert one currency to another
 *
 * Note: bitcoin is BTC, Ethereum is ETH, Litecoin is LTC
 *
 * For a full list of supported currencies see [this url](https://docs.openexchangerates.org/docs/supported-currencies)
 *
 * **Aliases**: `money`, `rate`
 * @module
 * @category converters
 * @name oxr
 * @example oxr 1 EUR USD
 * @param {number} MoneyAmount Amount of money to convert
 * @param {string} OriginCurrency Currency to convert from
 * @param {string} TargetCurrency Currency to convert to
 */

import { Currency, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { convertCurrency, currencyMap } from '@components/MoneyHelper';
import { deleteCommandMessages } from '@components/Utils';
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';
import { CurrencyUnits } from 'RibbonTypes';

type MoneyArgs = {
  value: number;
  fromCurrency: Currency;
  toCurrency: Currency;
};

export default class MoneyCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'oxr',
      aliases: [ 'money', 'rate' ],
      group: 'converters',
      memberName: 'oxr',
      description: 'Convert any currency into another',
      format: 'CurrencyAmount FirstValuta SecondValuta',
      details: 'Makes use of ISO 4217 standard currency codes (see list here: <https://docs.openexchangerates.org/docs/supported-currencies>)',
      examples: [ 'convert 50 USD EUR' ],
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
          type: 'currency',
        },
        {
          key: 'toCurrency',
          prompt: 'What is the valuta you want to convert **to**?',
          type: 'currency',
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { value, fromCurrency, toCurrency }: MoneyArgs) {
    try {
      const oxrEmbed = new MessageEmbed();
      const request = await fetch(`https://openexchangerates.org/api/latest.json?${stringify({
        app_id: process.env.OXR_API_KEY!,
        prettyprint: false,
        show_alternative: true,
      })}`);
      const response: {rates: CurrencyUnits; [propName: string]: unknown} = await request.json();
      const result = convertCurrency(response.rates, fromCurrency, toCurrency, value);

      oxrEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
        .setAuthor('🌐 Currency Converter')
        .addField(`:flag_${fromCurrency
          .slice(0, 2)
          .toLowerCase()}: Money in ${fromCurrency}`,
        `${
          currencyMap(fromCurrency)
            ? currencyMap(fromCurrency)
            : ''
        }${value}`,
        true)
        .addField(`:flag_${toCurrency
          .slice(0, 2)
          .toLowerCase()}: Money in ${toCurrency}`,
        `${
          currencyMap(toCurrency) ? currencyMap(toCurrency) : ''
        }${result}`,
        true)
        .setTimestamp();

      deleteCommandMessages(msg, this.client);

      return msg.embed(oxrEmbed);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`oxr\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Input:** \`${value}\` || \`${fromCurrency}\` || \`${toCurrency}\``);

      return msg.reply(oneLine`
        an error occurred.
        Make sure you used supported currency names.
        See the list here: <https://docs.openexchangerates.org/docs/supported-currencies>
      `);
    }
  }
}