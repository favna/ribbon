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

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as fs from 'fs';
import * as Fuse from 'fuse.js';
import * as moment from 'moment';
import * as path from 'path';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

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

            const eshopEmbed = new MessageEmbed();
            const eShopOptions: Fuse.FuseOptions<any> = {
                shouldSort: true,
                keys: [{ name: 'title', getfn: t => t.title, weight: 1 }],
                location: 0,
                distance: 100,
                threshold: 0.6,
                maxPatternLength: 32,
                minMatchCharLength: 1,
            };
            const games = JSON.parse(
                fs.readFileSync(path.join(__dirname, '../../data/databases/eshop.json'), 'utf8')
            );
            const fuse = new Fuse(games, eShopOptions);
            const results = fuse.search(game);
            const hit: any = results[0];

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
