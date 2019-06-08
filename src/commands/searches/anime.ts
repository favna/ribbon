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

import { ASSET_BASE_PATH, CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, removeDiacritics } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, User } from 'awesome-djs';
import moment from 'moment';
import 'moment-duration-format';
import fetch from 'node-fetch';
import { KitsuHit, KitsuResult } from 'RibbonTypes';

type AnimeArgs = {
    anime: string;
    hasManageMessages: boolean;
    position: number;
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

    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { anime, hasManageMessages, position = 0 }: AnimeArgs) {
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
            const animes: KitsuResult = await animeList.json();
            const color = msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR;
            let currentAnime = animes.hits[position];
            let animeEmbed = this.prepMessage(color, currentAnime, animes.hits.length, position, hasManageMessages);

            deleteCommandMessages(msg, this.client);

            const message = await msg.embed(animeEmbed, `https://kitsu.io/anime/${currentAnime.slug}`) as CommandoMessage;

            if (animes.hits.length > 1 && hasManageMessages) {
                injectNavigationEmotes(message);
                new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
                    .on('collect', (reaction: MessageReaction, user: User) => {
                        if (!this.client.userid.includes(user.id)) {
                            reaction.emoji.name === '➡' ? position++ : position--;
                            if (position >= animes.hits.length) position = 0;
                            if (position < 0) position = animes.hits.length - 1;
                            currentAnime = animes.hits[position];
                            animeEmbed = this.prepMessage(color, currentAnime, animes.hits.length, position, hasManageMessages);
                            message.edit(`https://kitsu.io/anime/${currentAnime.slug}`, animeEmbed);
                            message.reactions.get(reaction.emoji.name)!.users.remove(user);
                        }
                    });
            }

            return null;
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            return msg.reply(`no anime found for \`${anime}\` `);
        }
    }

    private prepMessage (
        color: string, anime: KitsuHit, animesLength: number,
        position: number, hasManageMessages: boolean): MessageEmbed {
        return new MessageEmbed()
            .setColor(color)
            .setTitle(anime.titles.en ? anime.titles.en : anime.canonicalTitle)
            .setURL(`https://kitsu.io/anime/${anime.id}`)
            .setDescription(anime.synopsis.replace(/(.+)[\r\n\t](.+)/gim, '$1 $2').split('\r\n')[0])
            .setImage(anime.posterImage.original)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/kitsulogo.png`)
            .setFooter(hasManageMessages ? `Result ${position + 1} of ${animesLength}` : '')
            .addField('Canonical Title', anime.canonicalTitle, true)
            .addField('Score', `${anime.averageRating}%`, true)
            .addField(
                'Episode(s)',
                anime.episodeCount ? anime.episodeCount : 'Still airing',
                true
            )
            .addField(
                'Episode Length',
                anime.episodeLength ? moment.duration(anime.episodeLength, 'minutes').format('h [hours] [and] m [minutes]') : 'unknown',
                true
            )
            .addField('Age Rating', anime.ageRating, true)
            .addField(
                'First Air Date',
                moment.unix(anime.startDate).format('MMMM Do YYYY'),
                true
            );
    }
}
