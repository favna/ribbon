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

import { CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter } from '@components/Utils';
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'awesome-djs';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { GoogleImageData, GoogleImageResult } from 'RibbonTypes';

type ImageArgs = {
    query: string;
    hasManageMessages: boolean;
    position: number;
};

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

    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { query, hasManageMessages, position = 0 }: ImageArgs) {
        const nsfwAllowed = msg.channel.type === 'text' ? (msg.channel as TextChannel).nsfw : true;
        const color = msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR;

        let imageEmbed = new MessageEmbed()
            .setColor(color);

        try {
            const imageSearch = await fetch(
                `https://www.googleapis.com/customsearch/v1?${stringify({
                    cx: process.env.IMAGE_KEY!,
                    key: process.env.GOOGLE_API_KEY!,
                    q: query,
                    safe: nsfwAllowed ? 'off' : 'active',
                    searchType: 'image',
                })}`
            );
            const imageData: GoogleImageResult = await imageSearch.json();

            let currentImage = imageData.items[position];
            imageEmbed = this.prepMessage(currentImage, query, imageData.items.length, position, hasManageMessages);

            deleteCommandMessages(msg, this.client);

            const message = await msg.embed(imageEmbed) as CommandoMessage;

            if (imageData.items.length > 1 && hasManageMessages) {
                injectNavigationEmotes(message);
                new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
                    .on('collect', (reaction: MessageReaction, user: User) => {
                        if (!this.client.userid.includes(user.id)) {
                            reaction.emoji.name === '➡' ? position++ : position--;
                            if (position >= imageData.items.length) position = 0;
                            if (position < 0) position = imageData.items.length - 1;
                            currentImage = imageData.items[position];
                            imageEmbed = this.prepMessage(currentImage, query, imageData.items.length, position, hasManageMessages);
                            message.edit('', imageEmbed);
                            message.reactions.get(reaction.emoji.name)!.users.remove(user);
                        }
                    });
            }

            return null;
            // tslint:disable-next-line: no-empty
        } catch {
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

            return msg.embed(imageEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`nothing found for \`${msg.argString}\``);
        }
    }

    private prepMessage (
        image: GoogleImageData, query: string, imageSearchLength: number,
        position: number, hasManageMessages: boolean): MessageEmbed {
        return new MessageEmbed()
            .setImage(image.link)
            .setURL(image.link)
            .setTitle(`Image results for: \`${query.replace(/\+/g, ' ')}\``)
            .setFooter(hasManageMessages ? `Result ${position + 1} of ${imageSearchLength}` : '');
    }
}
