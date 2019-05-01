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

import { ASSET_BASE_PATH, CollectorTimeout, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { IPokeItemAliases, PokeItemDetailsType } from '@components/Types';
import { clientHasManageMessages, deleteCommandMessages, injectNavigationEmotes, navigationReactionFilter, sentencecase } from '@components/Utils';
import { itemAliases } from '@pokedex/aliases';
import BattleItems from '@pokedex/items';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, MessageReaction, ReactionCollector, TextChannel, User } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import Fuse, { FuseOptions } from 'fuse.js';
import moment from 'moment';

type ItemArgs = {
    item: string;
    hasManageMessages: boolean;
    position: number;
};

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

    @clientHasManageMessages()
    public async run (msg: CommandoMessage, { item, hasManageMessages, position = 0 }: ItemArgs) {
        try {
            const itemOptions: FuseOptions<PokeItemDetailsType & IPokeItemAliases> = {
                keys: ['alias', 'item', 'id', 'name'],
                threshold: 0.3,
            };
            const aliasFuse = new Fuse(itemAliases, itemOptions);
            const itemFuse = new Fuse(BattleItems, itemOptions);
            const aliasSearch = aliasFuse.search(item);
            const itemSearch = aliasSearch.length ? itemFuse.search(aliasSearch[0].item) : itemFuse.search(item);
            const color = msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR;

            if (!itemSearch.length) throw new Error('no_item');

            let currentItem = itemSearch[position];
            let itemEmbed = this.prepMessage(color, currentItem, itemSearch.length, position);

            deleteCommandMessages(msg, this.client);

            const returnMsg = await msg.embed(itemEmbed) as CommandoMessage;

            if (itemSearch.length > 1 && hasManageMessages) {
                injectNavigationEmotes(returnMsg);
                new ReactionCollector(returnMsg, navigationReactionFilter, { time: CollectorTimeout.five })
                    .on('collect', (reaction: MessageReaction, user: User) => {
                        reaction.emoji.name === '➡' ? position++ : position--;
                        if (position >= itemSearch.length) position = 0;
                        if (position < 0) position = itemSearch.length - 1;
                        currentItem = itemSearch[position];
                        itemEmbed = this.prepMessage(color, currentItem, itemSearch.length, position);
                        returnMsg.edit('', itemEmbed);
                        returnMsg.reactions.get(reaction.emoji.name)!.users.remove(user);
                    });
            }

            return null;
        } catch (err) {
            deleteCommandMessages(msg, this.client);

            if (/(?:no_item)/i.test(err.toString())) return msg.reply(stripIndents`no item found for \`${item}\``);
            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`item\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author!.tag} (${msg.author!.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Input:** ${item}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
                    Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }

    private prepMessage (color: string, item: PokeItemDetailsType, itemSearchLength: number, position: number): MessageEmbed {
        return new MessageEmbed()
            .setColor(color)
            .setThumbnail(`${ASSET_BASE_PATH}/ribbon/unovadexclosedv2.png`)
            .setAuthor(
                `${sentencecase(item.name)}`,
                `https://play.pokemonshowdown.com/sprites/itemicons/${item.name.toLowerCase().replace(/ /g, '-')}.png`
            )
            .setFooter(`Result ${position + 1} of ${itemSearchLength}`)
            .addField('Description', item.desc)
            .addField('Generation Introduced', item.gen)
            .addField(
                'External Resources', oneLine`
            [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${sentencecase(item.name.replace(' ', '_').replace('\'', ''))})
            |  [Smogon](http://www.smogon.com/dex/sm/items/${item.name.toLowerCase().replace(' ', '_').replace('\'', '')})
            |  [PokémonDB](http://pokemondb.net/item/${item.name.toLowerCase().replace(' ', '-').replace('\'', '')})`
            );
    }
}
