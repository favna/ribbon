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

import { CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { UrbanDefinition, UrbanDefinitionResults } from '@components/Types';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, sentencecase } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, User } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import fetch from 'node-fetch';

type UrbanArgs = {
    term: string;
    hasManageMessages: boolean;
    position: number;
};

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

    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { term, hasManageMessages, position = 0 }: UrbanArgs) {
        try {
            const urbanSearch = await fetch(`https://api.urbandictionary.com/v0/define?${stringify({ term })}`);
            const urbanDefinitions: UrbanDefinitionResults = await urbanSearch.json();
            const color = msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR;

            urbanDefinitions.list.sort((a, b) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

            let currentDefinition = urbanDefinitions.list[position];
            let urbanEmbed = this.prepMessage(color, currentDefinition, urbanDefinitions.list.length, position);

            deleteCommandMessages(msg, this.client);

            const message = await msg.embed(urbanEmbed) as CommandoMessage;

            if (urbanDefinitions.list.length > 1 && hasManageMessages) {
                injectNavigationEmotes(message);
                new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
                    .on('collect', (reaction: MessageReaction, user: User) => {
                        if (!this.client.userid.includes(user.id)) {
                            reaction.emoji.name === '➡' ? position++ : position--;
                            if (position >= urbanDefinitions.list.length) position = 0;
                            if (position < 0) position = urbanDefinitions.list.length - 1;
                            currentDefinition = urbanDefinitions.list[position];
                            urbanEmbed = this.prepMessage(color, currentDefinition, urbanDefinitions.list.length, position);
                            message.edit(urbanEmbed);
                            message.reactions.get(reaction.emoji.name)!.users.remove(user);
                        }
                    });
            }

            return null;
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`no definitions found for \`${term}\``);
        }
    }

    private prepMessage (color: string, definition: UrbanDefinition, definitionsLength: number, position: number): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`Urban Search - ${definition.word}`)
            .setURL(definition.permalink)
            .setColor(color)
            .setDescription(sentencecase(definition.definition.replace(/[\[]]/gim, '')))
            .setFooter(`Result ${position + 1} of ${definitionsLength}`)
            .addField(
                'Example',
                definition.example
                    ? `${definition.example.slice(0, 1020)}${
                    definition.example.length >= 1024
                        ? '...'
                        : ''
                    }`
                    : 'None'
            );
    }
}
