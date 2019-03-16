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

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';
import { deleteCommandMessages, eShopType, startTyping, stopTyping } from '../../components';
import shopData from '../../data/databases/eshop.json';

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
                    key: 'game',
                    prompt: 'What game to find?',
                    type: 'string',
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { game, price = 'TBA' }: { game: string; price?: string }) {
        try {
            startTyping(msg);

            const eshopData: eShopType[] = shopData as eShopType[];
            const eshopEmbed = new MessageEmbed();
            const eShopOptions: FuseOptions<eShopType> = { keys: ['title'] };
            const fuse = new Fuse(eshopData, eShopOptions);
            const results = fuse.search(game);
            const hit = results[0];

            if (hit.eshop_price) price = hit.eshop_price === '0.00' ? 'free' : `$${hit.eshop_price} USD`;

            eshopEmbed
                .setTitle(hit.title)
                .setURL(`https://www.nintendo.com/games/detail/${hit.slug}`)
                .setThumbnail(hit.front_box_art)
                .setColor('#FFA600')
                .addField('eShop Price', price, true)
                .addField('Release Date', moment(hit.release_date, 'MMM DD YYYY').format('MMMM Do YYYY'), true)
                .addField('Number of Players', hit.number_of_players, true)
                .addField('Game Code', hit.game_code, true)
                .addField('NSUID', hit.nsuid ? hit.nsuid : 'TBD', true)
                .addField('Categories', typeof hit.categories.category === 'object' ? hit.categories.category.join(', ') : hit.categories.category, true);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(eshopEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(`no titles found for \`${game}\``);
        }
    }
}
