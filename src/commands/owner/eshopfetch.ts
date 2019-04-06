/**
 * @file Owner EShopFetchCommand - Fetch the latest data for the eShop command
 *
 * **Aliases**: `efetch`
 * @module
 * @category owner
 * @name eshopfetch
 */

import { decache } from '@components/Decache';
import { deleteCommandMessages, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import fs from 'fs';
import { getGamesAmerica } from 'nintendo-switch-eshop';
import path from 'path';

export default class EShopFetchCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'eshopfetch',
            aliases: ['efetch'],
            group: 'owner',
            memberName: 'eshopfetch',
            description: 'Fetches latest games list from the Nintendo Switch eShop',
            examples: ['eshopfetch'],
            guildOnly: false,
            ownerOnly: true,
            guarded: true,
            hidden: true,
        });
    }

    public async run (msg: CommandoMessage) {
        startTyping(msg);
        fs.writeFileSync(
            path.join(__dirname, '../../data/databases/eshop.json'),
            JSON.stringify(await getGamesAmerica({ shop: 'all' })),
            'utf8'
        );
        decache(path.join(__dirname, '../../data/databases/eshop.json'));
        this.client.registry.resolveCommand('searches:eshop').reload();

        if (fs.existsSync(path.join(__dirname, '../../data/databases/eshop.json'))) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply('latest eShop data stored in file');
        }
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('an error occurred fetching latest data!');
    }
}
