/**
 * @file Searches AnimeCommand - Gets information about any anime from kitsu.io
 *
 * **Aliases**: `ani`, `mal`, `kitsu`
 * @module
 * @category searches
 * @name anime
 * @example anime Yu-Gi-Oh Dual Monsters
 * @param {string} AnimeName anime to look up
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, removeDiacritics } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import moment from 'moment';
import 'moment-duration-format';
import fetch from 'node-fetch';

type AnimeArgs = {
    anime: string;
};

export default class AnimeCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'anime',
            aliases: ['ani', 'mal', 'kitsu'],
            group: 'searches',
            memberName: 'anime',
            description: 'Finds anime on kitsu.io',
            format: 'AnimeName',
            examples: ['anime Yu-Gi-Oh Dual Monsters'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'anime',
                    prompt: 'What anime do you want to find?',
                    type: 'string',
                    parse: (p: string) => removeDiacritics(p.toLowerCase().replace(/([^a-zA-Z0-9_\- ])/gm, '')),
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { anime }: AnimeArgs) {
        try {
            const animeList = await fetch(
                `https://${process.env.KITSU_ID!}-dsn.algolia.net/1/indexes/production_media/query`,
                {
                    body: JSON.stringify({ params: `query=${anime}&facetFilters=[\"kind:anime\"]` }),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Algolia-API-Key': process.env.KITSU_KEY!,
                        'X-Algolia-Application-Id': process.env.KITSU_ID!,
                    },
                    method: 'POST',
                }
            );
            const animes = await animeList.json();
            const hit = animes.hits[0];
            const animeEmbed = new MessageEmbed();

            animeEmbed
                .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
                .setTitle(hit.titles.en ? hit.titles.en : hit.canonicalTitle)
                .setURL(`https://kitsu.io/anime/${hit.id}`)
                .setDescription(hit.synopsis.replace(/(.+)[\r\n\t](.+)/gim, '$1 $2').split('\r\n')[0])
                .setImage(hit.posterImage.original)
                .setThumbnail(`${ASSET_BASE_PATH}/ribbon/kitsulogo.png`)
                .addField('Canonical Title', hit.canonicalTitle, true)
                .addField('Score', `${hit.averageRating}%`, true)
                .addField(
                    'Episode(s)',
                    hit.episodeCount ? hit.episodeCount : 'Still airing',
                    true
                )
                .addField(
                    'Episode Length',
                    hit.episodeLength ? moment.duration(hit.episodeLength, 'minutes').format('h [hours] [and] m [minutes]') : 'unknown',
                    true
                )
                .addField('Age Rating', hit.ageRating, true)
                .addField(
                    'First Air Date',
                    moment.unix(hit.startDate).format('MMMM Do YYYY'),
                    true
                );

            deleteCommandMessages(msg, this.client);

            return msg.embed(animeEmbed, `https://kitsu.io/anime/${hit.slug}`);
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`no anime found for \`${anime}\` `);
        }
    }
}
