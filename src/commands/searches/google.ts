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

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import cheerio from 'cheerio';
import { oneLine } from 'common-tags';
import fetch from 'node-fetch';
import { DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping } from '../../components';

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

    public async run (msg: CommandoMessage, { query }: { query: string }) {
        const nsfwAllowed = msg.channel.type === 'text' ? (msg.channel as TextChannel).nsfw : true;
        const googleEmbed = new MessageEmbed();

        googleEmbed.setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR);
        startTyping(msg);

        try {
            const knowledgeSearch = await fetch(
                `https://kgsearch.googleapis.com/v1/entities:search?${stringify(
                    {
                        query,
                        indent: 'True',
                        key: (process.env.GOOGLE_API_KEY as string),
                        limit: 1,
                    }
                ).replace(/%2B/gm, '+')}`
            );
            const knowledgeData = await knowledgeSearch.json();
            const result = knowledgeData.itemListElement[0].result;

            let types = result['@type'].map((t: string) => t.replace(/([a-z])([A-Z])/g, '$1 $2'));
            if (types.length > 1) types = types.filter((t: string) => t !== 'Thing');

            if (!result.detailedDescription) throw new Error('not_enough_knowledge_data_should_continue');
            if (nsfwAllowed || !msg.guild.settings.get('blockUnexplicitNsfw', true)) googleEmbed.setImage(result.image.contentUrl);

            googleEmbed
                .setTitle(`${result.name} ${types.length === 0 ? '' : `(${types.join(', ')})`}`)
                .setURL(result.detailedDescription.url)
                .setDescription(oneLine`${result.detailedDescription.articleBody}
                    [Learn More...](${String(result.detailedDescription.url).replace(/\(/, '%28').replace(/\)/, '%29')})`
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(googleEmbed);
        } catch (err) {
            // Intentionally empty
        }

        try {
            const googleSearch = await fetch(
                `https://www.googleapis.com/customsearch/v1?${stringify({
                    cx: (process.env.SEARCH_KEY as string),
                    key: (process.env.GOOGLE_API_KEY as string),
                    q: query,
                    safe: nsfwAllowed ? 'off' : 'active',
                })}`
            );
            const googleData = await googleSearch.json();
            const item = googleData.items[0];

            googleEmbed
                .setTitle(item.title)
                .setURL(item.link)
                .setDescription(item.snippet);

            if (item.pagemap.cse_image) {
                if ((nsfwAllowed && item.pagemap.cse_image[0].src) ||
                    (!msg.guild.settings.get('blockUnexplicitNsfw', true) && item.pagemap.cse_image[0].src)) {
                    googleEmbed.setImage(item.pagemap.cse_image[0].src);
                }
            }

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(googleEmbed);
        } catch (err) {
            // Intentionally empty
        }

        try {
            const backupSearch = await fetch(
                `https://www.google.com/search?${stringify({
                    cr: 'countryGB',
                    lr: 'lang_en',
                    q: query,
                    safe: nsfwAllowed ? 'off' : 'active',
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

            googleEmbed
                .setTitle(`Google Search Result for ${query}`)
                .setDescription(href)
                .setURL(href)
                .setFooter(`If you see this please contact ${this.client.owners[0].tag} (${this.client.owners[0].id}) as there is likely some issue with the Google search command`);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(googleEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`error occurred or nothing found for \`${query}\``);
        }
    }
}
