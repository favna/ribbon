/**
 * @file Searches GoogleCommand - Gets information through Google
 *
 * Note: prioritizes Knowledge Graphs for better searching
 *
 * **Aliases**: `search`, `g`
 * @module
 * @category searches
 * @name google
 * @example google Pyrrha Nikos
 * @param {string} SearchQuery Thing to find on Google
 */

import { CollectorTimeout, DEFAULT_EMBED_COLOR, GoogleSource } from '@components/Constants';
import { GoogleCSEItem, GoogleItem, GoogleKnowledgeItem } from '@components/Types';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import cheerio from 'cheerio';
import { oneLine } from 'common-tags';
import fetch from 'node-fetch';

type GoogleArgs = {
    query: string;
    hasManageMessages: boolean;
    position: number;
};

export default class GoogleCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'google',
            aliases: ['search', 'g'],
            group: 'searches',
            memberName: 'google',
            description: 'Finds anything on google',
            format: 'GoogleQuery',
            examples: ['google Pyrrha Nikos'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'query',
                    prompt: 'What do you want to google?',
                    type: 'string',
                    parse: (p: string) => p.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '').replace(/ /g, '+'),
                }
            ],
        });
    }

    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { query, hasManageMessages, position = 0 }: GoogleArgs) {
        try {
            const knowledgeSearch = await fetch(
                `https://kgsearch.googleapis.com/v1/entities:search?${stringify(
                    {
                        query,
                        indent: 'True',
                        key: process.env.GOOGLE_API_KEY!,
                        limit: 1,
                    }
                ).replace(/%2B/gm, '+')}`
            );

            const googleSearch = await fetch(
                `https://www.googleapis.com/customsearch/v1?${stringify({
                    cx: process.env.SEARCH_KEY!,
                    key: process.env.GOOGLE_API_KEY!,
                    q: query,
                    safe: this.isNsfwAllowed(msg) ? 'off' : 'active',
                })}`
            );

            const cseData: { items: GoogleCSEItem[] } = await googleSearch.json();
            const cseItems = cseData.items.map(googleItem => ({ ...googleItem, source: GoogleSource.CSE }));

            const knowledgeData: { itemListElement: GoogleKnowledgeItem[] } = await knowledgeSearch.json();
            const knowledgeItems = knowledgeData.itemListElement.map(item => (
                {
                    ...item.result,
                    source: GoogleSource.KNOWLEDGE,
                }
            ));

            knowledgeItems.map(item => {
                const types = item['@type'].map((t: string) => t.replace(/([a-z])([A-Z])/g, '$1 $2'));
                return types.length > 1 ? item['@type'] = types.filter((t: string) => t !== 'Thing') : item['@type'];
            });

            const googleItems: GoogleItem[] = [...cseItems, ...knowledgeItems];

            let currentItem = googleItems[position];
            let googleEmbed = this.prepMessage(msg, currentItem, googleItems.length, position);

            deleteCommandMessages(msg, this.client);

            const message = await msg.embed(googleEmbed) as CommandoMessage;

            if (googleItems.length > 1 && hasManageMessages) {
                injectNavigationEmotes(message);
                new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
                    .on('collect', (reaction: MessageReaction, user: User) => {
                        if (!this.client.userid.includes(user.id)) {
                            reaction.emoji.name === '➡' ? position++ : position--;
                            if (position >= googleItems.length) position = 0;
                            if (position < 0) position = googleItems.length - 1;
                            currentItem = googleItems[position];
                            googleEmbed = this.prepMessage(msg, currentItem, googleItems.length, position);
                            message.edit('', googleEmbed);
                            message.reactions.get(reaction.emoji.name)!.users.remove(user);
                        }
                    });
            }

            return null;
        } catch (err) {
            // Intentionally empty
        }

        try {
            const backupSearch = await fetch(
                `https://www.google.com/search?${stringify({
                    cr: 'countryGB',
                    lr: 'lang_en',
                    q: query,
                    safe: this.isNsfwAllowed(msg) ? 'off' : 'active',
                })}`
            );
            const $ = cheerio.load(await backupSearch.text());
            const href = $('.r')
                .first()
                .find('a')
                .first()
                .attr('href')
                .replace('/url?q=', '')
                .split('&')[0];

            const googleEmbed = new MessageEmbed()
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
                .setTitle(`Google Search Result for ${query}`)
                .setDescription(href)
                .setURL(href)
                .setFooter(`If you see this please contact ${this.client.owners[0].tag} (${this.client.owners[0].id}) as there is likely some issue with the Google search command`);

            deleteCommandMessages(msg, this.client);

            return msg.embed(googleEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`error occurred or nothing found for \`${query}\``);
        }
    }

    private prepMessage (msg: CommandoMessage, item: any, itemLength: number, position: number): MessageEmbed {
        const googleEmbed = new MessageEmbed()
            .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
            .setFooter(`Result ${position + 1} of ${itemLength}`);

        if (item.source === GoogleSource.CSE) {
            const cseItem = item as GoogleCSEItem;
            googleEmbed
                .setTitle(cseItem.title)
                .setURL(cseItem.link)
                .setDescription(cseItem.snippet);

            if (cseItem.pagemap.cse_image && cseItem.pagemap.cse_image[0].src) {
                googleEmbed.setImage(cseItem.pagemap.cse_image[0].src);
            }
        } else {
            const knowledgeItem = item as GoogleKnowledgeItem['result'];
            googleEmbed
                .setTitle(`${knowledgeItem.name} ${knowledgeItem['@type'].length === 0 ? '' : `(${knowledgeItem['@type'].join(', ')})`}`)
                .setURL(knowledgeItem.detailedDescription.url)
                .setDescription(oneLine`${knowledgeItem.detailedDescription.articleBody}
                    [Learn More...](${String(knowledgeItem.detailedDescription.url).replace(/\(/, '%28').replace(/\)/, '%29')})`
                );
        }

        return googleEmbed;
    }

    private isNsfwAllowed (msg: CommandoMessage): boolean {
        return msg.channel.type === 'text' ? (msg.channel as TextChannel).nsfw : true;
    }
}
