/**
 * @file Searches ImageCommand - Gets an image through Google Images
 *
 * **Aliases**: `img`, `i`
 * @module
 * @category searches
 * @name image
 * @example image Pyrrha Nikos'
 * @param {string} ImageQuery Image to find on Google Images
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class ImageCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'image',
            aliases: ['img', 'i'],
            group: 'searches',
            memberName: 'image',
            description: 'Finds an image through Google',
            format: 'ImageQuery',
            examples: ['image Pyrrha Nikos'],
            nsfw: true,
            explicit: false,
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'query',
                    prompt: 'What do you want to find images of?',
                    type: 'string',
                    parse: (p: string) => p.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '')
                        .split(' ')
                        .map(x => encodeURIComponent(x))
                        .join('+'),
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { query }: { query: string }) {
        const nsfwAllowed = msg.channel.type === 'text' ? (msg.channel as TextChannel).nsfw : true;
        const imageEmbed = new MessageEmbed();

        imageEmbed.setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR);

        try {
            startTyping(msg);
            const imageSearch = await fetch(
                `https://www.googleapis.com/customsearch/v1?${stringify({
                    cx: process.env.IMAGE_KEY,
                    key: process.env.GOOGLE_API_KEY,
                    q: query,
                    safe: nsfwAllowed ? 'off' : 'active',
                    searchType: 'image',
                })}`
            );
            const imageData = await imageSearch.json();

            imageEmbed
                .setImage(imageData.items[0].link)
                .setFooter(`Search query: "${query.replace(/\+/g, ' ')}"`);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(imageEmbed);
        } catch (err) {
            // Intentionally empty
        }

        try {
            const backupSearch = await fetch(
                `https://www.google.com/search?${stringify({
                    gs_l: 'img',
                    q: query,
                    safe: nsfwAllowed ? 'off' : 'active',
                    tbm: 'isch',
                })}`
            );
            const $ = cheerio.load(await backupSearch.text());
            const src = $('.images_table')
                .find('img')
                .first()
                .attr('src');

            imageEmbed
                .setTitle(`Google Search Result for ${query}`)
                .setImage(src)
                .setURL(src)
                .setFooter(`If you see this please contact ${this.client.owners[0].tag} (${this.client.owners[0].id}) as there is likely some issue with the Google search command`);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(imageEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`nothing found for \`${msg.argString}\``);
        }
    }
}
