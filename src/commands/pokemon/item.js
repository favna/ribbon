/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

/**
 * @file Pokémon ItemCommand - Gets information about an item in Pokémon
 * For item names existing of multiple words (for example `life orb`) you can either type it with or without the space  
 * **Aliases**: `it`, `bag`
 * @module
 * @category pokemon
 * @name item
 * @example item assault vest
 * @param {string} ItemName Name of the item to find
 * @returns {MessageEmbed} Description and external links for the item
 *
 * @todo Implement FuseJS in Item
 * @body FuseJS will take away the need to use matcher and allow for far more consistent results
 */

const Matcher = require('did-you-mean'),
  commando = require('discord.js-commando'),
  path = require('path'),
  underscore = require('underscore'),
  {MessageEmbed} = require('discord.js'),
  {BattleItems} = require(path.join(__dirname, '../../data/dex/items')),
  {ItemAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {oneLine} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages} = require('../../util.js');

module.exports = class ItemCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'item',
      'memberName': 'item',
      'group': 'pokemon',
      'aliases': ['it', 'bag'],
      'description': 'Get the info on an item in Pokémon',
      'format': 'ItemName',
      'examples': ['item Life Orb'],
      'guildOnly': false,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'item',
          'prompt': 'Get info on which item?',
          'type': 'string',
          'parse': p => p.toLowerCase().replace(/ /g, '')
        }
      ]
    });

    this.match = [];
  }

  run (msg, args) {
    const itemEmbed = new MessageEmbed();

    let itemEntry = {};

    if (ItemAliases[args.item]) {
      args.item = ItemAliases[args.item];
      this.match = new Matcher(Object.keys(ItemAliases).join(' '));
    } else {
      this.match = new Matcher(Object.keys(BattleItems).join(' '));
    }

    itemEntry = BattleItems[args.item];

    for (const item in BattleItems) {
      if (BattleItems[item].id.toLowerCase() === args.item.toLowerCase() || BattleItems[item].name.toLowerCase() === args.item.toLowerCase()) {
        itemEntry = BattleItems[item];
        break;
      }
    }

    if (!underscore.isEmpty(itemEntry)) {
      itemEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png')
        .setAuthor(`${capitalizeFirstLetter(itemEntry.name)}`, `https://play.pokemonshowdown.com/sprites/itemicons/${itemEntry.name.toLowerCase().replace(/ /g, '-')}.png`)
        .addField('Description', itemEntry.desc)
        .addField('Generation Introduced', itemEntry.gen)
        .addField('External Resources', oneLine`
			[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(itemEntry.name.replace(' ', '_').replace('\'', ''))})  
			|  [Smogon](http://www.smogon.com/dex/sm/items/${itemEntry.name.toLowerCase().replace(' ', '_')
    .replace('\'', '')})  
			|  [PokémonDB](http://pokemondb.net/item/${itemEntry.name.toLowerCase().replace(' ', '-')
    .replace('\'', '')})`);

      deleteCommandMessages(msg, this.client);

      return msg.embed(itemEmbed, `**${capitalizeFirstLetter(itemEntry.name)}**`);
    }
    this.match.setThreshold(4);
    const dym = this.match.get(args.item), // eslint-disable-line one-var
      dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the item name?';

    deleteCommandMessages(msg, this.client);

    return msg.reply(`Item not found! ${dymString}`);

  }
};