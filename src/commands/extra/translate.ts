/**
 * @file Extra TranslateCommand - Translate any word from any language to any other language
 *
 * Language specifications can be either 1 or 2 letter ISO 639 or full names
 *
 * **Aliases**: `tr`
 * @module
 * @category extra
 * @name translate
 * @example translate en nl Hello World
 * @param {string} FromLanguage The language to translate from
 * @param {string} ToLanguage The language to translate to
 * @param {string} Text The word or text to translate
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';

export default class TranslateCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'translate',
            aliases: ['tr'],
            group: 'extra',
            memberName: 'translate',
            description: 'Translate any word from any language to any other language',
            format: 'FromLanguage ToLanguage Text',
            details: 'Language specifications can be either 1 or 2 letter ISO 639 or full names',
            examples: ['translate en nl Hello World'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'fromlang',
                    prompt: 'Translate from which language?',
                    type: 'string',
                },
                {
                    key: 'tolang',
                    prompt: 'Translate to which language?',
                    type: 'string',
                },
                {
                    key: 'text',
                    prompt: 'Translate what?',
                    type: 'string',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { fromlang, tolang, text }: { fromlang: string; tolang: string; text: string }) {
        try {
            const transEmbed = new MessageEmbed();
            const request = await fetch(
                `https://translation.googleapis.com/language/translate/v2?${stringify({
                    format: 'text',
                    key: process.env.GOOGLE_API_KEY!,
                    q: text,
                    source: fromlang,
                    target: tolang,
                })}`, { headers: { 'Content-Type': 'application/json' }, method: 'POST' }
            );
            const response = await request.json();

            if (response.error) throw new Error('invalid_request');

            transEmbed
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
                .setTitle(`__Translating from ${fromlang.toUpperCase()} to ${tolang.toUpperCase()}__`)
                .setDescription(stripIndents`
                    \`${text}\`

                    \`${response.data.translations[0].translatedText}\`
                `);

            deleteCommandMessages(msg, this.client);

            return msg.embed(transEmbed);
        } catch (err) {
            if (/(?:invalid_request)/i.test(err.toString())) {
                return msg.reply(
                    'either your from language or to language was not recognized. Please use ISO 639-1 codes for the languages (<https://cloud.google.com/translate/docs/languages>)'
                );
            }

            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`translate\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author!.tag} (${msg.author!.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **From Language** ${fromlang}
                **To Language** ${tolang}
                **Text** ${text}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
