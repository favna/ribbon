/**
 * @file Searches UrbanCommand - Define a word using UrbanDictionary
 *
 * **Aliases**: `ub`, `ud`
 * @module
 * @category searches
 * @name urban
 * @example urban Everclear
 * @param {string} PhraseQuery Phrase that you want to define
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { capitalizeFirstLetter, DEFAULT_EMBED_COLOR, deleteCommandMessages, IUrbanDefinition, startTyping, stopTyping, stringify } from '../../components';

export default class UrbanCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'urban',
            aliases: ['ub', 'ud'],
            group: 'searches',
            memberName: 'urban',
            description: 'Find definitions on urban dictionary',
            format: 'Term',
            examples: ['urban ugt'],
            nsfw: true,
            explicit: false,
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'term',
                    prompt: 'What term do you want to define?',
                    type: 'string',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { term }: { term: string }) {
        try {
            startTyping(msg);
            const urbanSearch = await fetch(`https://api.urbandictionary.com/v0/define?${stringify({ term })}`);
            const definition = await urbanSearch.json();
            const hit: IUrbanDefinition = definition.list[0];
            const urbanEmbed = new MessageEmbed();

            definition.list.sort((a: IUrbanDefinition, b: IUrbanDefinition) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

            urbanEmbed
                .setTitle(`Urban Search - ${hit.word}`)
                .setURL(hit.permalink)
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
                .setDescription(capitalizeFirstLetter(hit.definition.replace(/[\[]]/gim, '')))
                .addField(
                    'Example',
                    hit.example
                        ? `${hit.example.slice(0, 1020)}${
                            hit.example.length >= 1024
                                ? '...'
                                : ''
                            }`
                        : 'None'
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(urbanEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`no definitions found for \`${term}\``);
        }
    }
}
