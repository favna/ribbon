/**
 * @file Pokémon ItemCommand - Gets information about an item in Pokémon
 *
 * For item names existing of multiple words (for example `life orb`) you can either type it with or without the space
 *
 * **Aliases**: `it`, `bag`
 * @module
 * @category pokemon
 * @name item
 * @example item assault vest
 * @param {string} ItemName Name of the item to find
 */

import { oneLine, stripIndents } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import Fuse from 'fuse.js';
import moment from 'moment';
import { ASSET_BASE_PATH, capitalizeFirstLetter, DEFAULT_EMBED_COLOR, deleteCommandMessages, startTyping, stopTyping, UnionPokeItem } from '../../components';
import { BattleItems, ItemAliases } from '../../data/dex';

export default class ItemCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'item',
            aliases: ['it', 'bag'],
            group: 'pokemon',
            memberName: 'item',
            description: 'Get the info on an item in Pokémon',
            format: 'ItemName',
            examples: ['item Life Orb'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'item',
                    prompt: 'Get info on which item?',
                    type: 'string',
                    parse: (p: string) => p.toLowerCase().replace(/ /g, ''),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { item }: { item: string }) {
        try {
            startTyping(msg);
            const itemOptions: Fuse.FuseOptions<UnionPokeItem> = {
                shouldSort: true,
                keys: [
                    { name: 'alias', getfn: t => t.alias, weight: 1 },
                    { name: 'item', getfn: t => t.item, weight: 1 },
                    { name: 'id', getfn: t => t.id, weight: 1 },
                    { name: 'name', getfn: t => t.name, weight: 1 }
                ],
                location: 0,
                distance: 100,
                threshold: 0.3,
                maxPatternLength: 32,
                minMatchCharLength: 1,
            };
            const aliasFuse = new Fuse(ItemAliases, itemOptions);
            const itemFuse = new Fuse(BattleItems, itemOptions);
            const aliasSearch = aliasFuse.search(item);
            const itemSearch = aliasSearch.length ? itemFuse.search(aliasSearch[0].item) : itemFuse.search(item);
            const itemEmbed = new MessageEmbed();

            if (!itemSearch.length) throw new Error('no_item');

            itemEmbed
                .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
                .setThumbnail(`${ASSET_BASE_PATH}/ribbon/unovadexclosedv2.png`)
                .setAuthor(
                    `${capitalizeFirstLetter(itemSearch[0].name)}`,
                    `https://play.pokemonshowdown.com/sprites/itemicons/${itemSearch[0].name.toLowerCase().replace(/ /g, '-')}.png`
                )
                .addField('Description', itemSearch[0].desc)
                .addField('Generation Introduced', itemSearch[0].gen)
                .addField(
                    'External Resources', oneLine`
			        [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(itemSearch[0].name.replace(' ', '_').replace('\'', ''))})
			        |  [Smogon](http://www.smogon.com/dex/sm/items/${itemSearch[0].name.toLowerCase().replace(' ', '_').replace('\'', '')})
			        |  [PokémonDB](http://pokemondb.net/item/${itemSearch[0].name.toLowerCase().replace(' ', '-').replace('\'', '')})`
                );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(itemEmbed, `**${capitalizeFirstLetter(itemSearch[0].name)}**`);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            if (/(?:no_item)/i.test(err.toString())) return msg.reply(stripIndents`no item found for \`${item}\``);
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`item\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** ${item}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
