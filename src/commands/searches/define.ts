/**
 * @file Searches DefineCommand - Define a word using glosbe
 *
 * **Aliases**: `def`, `dict`
 * @module
 * @category searches
 * @name define
 * @example define Google
 * @param {string} Word the word you want to define
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import fetch from 'node-fetch';
import { DEFAULT_EMBED_COLOR, deleteCommandMessages, IDefineWord, startTyping, stopTyping } from '../../components';

export default class DefineCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'define',
            aliases: ['def', 'dict'],
            group: 'searches',
            memberName: 'define',
            description: 'Gets the definition on a word on glosbe',
            format: 'Word',
            examples: ['define pixel'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'query',
                    prompt: 'What word do you want to define?',
                    type: 'string',
                    parse: (p: string) => p.replace(/[^a-zA-Z]/g, ''),
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { query }: { query: string }) {
        try {
            startTyping(msg);
            const defineEmbed = new MessageEmbed();
            const res = await fetch(
                `https://glosbe.com/gapi/translate?${stringify({
                    dest: 'en',
                    format: 'json',
                    from: 'en',
                    phrase: query,
                })}`
            );
            const words = await res.json();
            const final = [`**Definitions for __${query}__:**`];

            words.tuc[0].meanings.slice(0, 5).forEach((word: IDefineWord, index: number) => {
                const definition = word.text
                    .replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '_')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, '\'')
                    .replace(/<b>/g, '[')
                    .replace(/<\/b>/g, ']')
                    .replace(/<i>|<\/i>/g, '_');
                final.push(`**${index + 1}:** ${definition}`);
            });

            defineEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
                .setDescription(final);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(defineEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(
                `nothing found for \`${query}\`, maybe check your spelling?`
            );
        }
    }
}
