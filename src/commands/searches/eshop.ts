/**
 * @file Searches EShopCommand - Gets information about a game in the Nintendo Switch eShop
 *
 * **Aliases**: `shop`
 * @module
 * @category searches
 * @name eshop
 * @example eshop Breath of The Wild
 * @param {string} GameName Game that you want to find in the eShop
 */

import { CollectorTimeout } from '@components/Constants';
import { eShopHit, eShopResult } from '@components/Types';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, sentencecase } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, User } from 'awesome-djs';
import { stringify } from 'awesome-querystring';
import moment from 'moment';
import fetch from 'node-fetch';

type EShopArgs = {
    query: string;
    hasManageMessages: boolean;
    position: number;
};

export default class EShopCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'eshop',
            aliases: ['shop'],
            group: 'searches',
            memberName: 'eshop',
            description: 'Gets any game from the Nintendo eShop',
            format: 'GameName',
            examples: ['eshop Breath of the Wild'],
            guildOnly: false,
            args: [
                {
                    key: 'query',
                    prompt: 'What game to find?',
                    type: 'string',
                }
            ],
        });
    }

    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { query, hasManageMessages, position = 0 }: EShopArgs) {
        try {
            const gamesList = await fetch(
                `https://${process.env.NINTENDO_ALGOLIA_ID}-dsn.algolia.net/1/indexes/*/queries`,
                {
                    body: JSON.stringify(
                        {
                            requests: [
                                {
                                    indexName: 'noa_aem_game_en_us',
                                    params: stringify({
                                        facetFilters: [
                                            ['filterShops:On Nintendo.com'],
                                            ['platform:Nintendo Switch']
                                        ],
                                        facets: [
                                            'generalFilters', 'platform', 'availability', 'categories',
                                            'filterShops', 'virtualConsole', 'characters', 'priceRange',
                                            'esrb', 'filterPlayers'
                                        ],
                                        hitsPerPage: 42,
                                        maxValuesPerFacet: 30,
                                        page: 0,
                                        query,
                                    }),
                                }
                            ],
                        }
                    ),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Algolia-API-Key': process.env.NINTENDO_ALOGLIA_KEY!,
                        'X-Algolia-Application-Id': process.env.NINTENDO_ALGOLIA_ID!,
                    },
                    method: 'POST',
                }
            );

            const games: eShopResult = await gamesList.json();
            const results = games.results[0];

            let currentGame = results.hits[position];
            let eshopEmbed = this.prepMessage(currentGame, results.hits.length, position, hasManageMessages);

            deleteCommandMessages(msg, this.client);

            const message = await msg.embed(eshopEmbed) as CommandoMessage;

            if (results.hits.length > 1 && hasManageMessages) {
                injectNavigationEmotes(message);
                new ReactionCollector(message, navigationReactionFilter, { time: CollectorTimeout.five })
                    .on('collect', (reaction: MessageReaction, user: User) => {
                        if (!this.client.userid.includes(user.id)) {
                            reaction.emoji.name === '➡' ? position++ : position--;
                            if (position >= results.hits.length) position = 0;
                            if (position < 0) position = results.hits.length - 1;
                            currentGame = results.hits[position];
                            eshopEmbed = this.prepMessage(currentGame, results.hits.length, position, hasManageMessages);
                            message.edit('', eshopEmbed);
                            message.reactions.get(reaction.emoji.name)!.users.remove(user);
                        }
                    });
            }

            return null;
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            return msg.reply(`no titles found for \`${query}\``);
        }
    }

    private prepMessage (
        game: eShopHit, gamesLength: number,
        position: number, hasManageMessages: boolean
    ): MessageEmbed {
        return new MessageEmbed()
            .setColor('#FFA600')
            .setTitle(game.title)
            .setURL(`https://nintendo.com${game.url}`)
            .setThumbnail(`https://nintendo.com${game.boxArt}`)
            .setDescription(`${game.description.length <= 800 ? game.description : `${game.description.slice(0, 800)}…`}`)
            .setFooter(hasManageMessages ? `Result ${position + 1} of ${gamesLength}` : '')
            .addField('ESRB', game.esrb, true)
            .addField('Price', game.msrp ? game.msrp === 0 ? 'Free' : `$${game.msrp} USD` : 'TBA', true)
            .addField('Availability', game.availability[0], true)
            .addField('Release Date', game.releaseDateMask === 'TBD' ? game.releaseDateMask : moment(game.releaseDateMask).format('MMMM Do YYYY'), true)
            .addField('Number of Players', sentencecase(game.players), true)
            .addField('Platform', game.platform, true)
            .addField('NSUID', game.nsuid ? game.nsuid : 'TBD', true)
            .addField('Categories', game.categories.join(', '), false);
    }
}
