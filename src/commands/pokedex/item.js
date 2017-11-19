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
const Discord = require('discord.js'),
	Matcher = require('did-you-mean'),
	Path = require('path'),
	commando = require('discord.js-commando'),
	items = require(Path.join(__dirname, 'data/items.js')).BattleItems,
	{oneLine} = require('common-tags');

const capitalizeFirstLetter = function (string) { // eslint-disable-line one-var
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	match = new Matcher(Object.keys(items).join(' '));

module.exports = class itemCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'item',
			'group': 'pokedex',
			'aliases': ['it', 'bag'],
			'memberName': 'item',
			'description': 'Get the info on an item in Pokémon',
			'examples': ['item {Item Name}', 'item Life Orb'],
			'guildOnly': false,

			'args': [
				{
					'key': 'item',
					'prompt': 'Get info on which item?',
					'type': 'string',
					'label': 'Item to find'
				}
			]
		});
	}

	run (msg, args) {
		let item = {};

		for (let index = 0; index < Object.keys(items).length; index += 1) {
			if (items[Object.keys(items)[index]].id.toLowerCase() === args.item.toLowerCase().replace(' ', '')
				.replace('\'', '')) {
				item = items[Object.keys(items)[index]];
				break;
			}
		}

		if (item) {
			const itemEmbed = new Discord.MessageEmbed();

			itemEmbed
				.setColor('#FF0000')
				.addField('Description', item.desc)
				.addField('Generation Introduced', item.gen)
				.addField('External Resources', oneLine `
                [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(item.name.replace(' ', '_').replace('\'', ''))})  
                |  [Smogon](http://www.smogon.com/dex/sm/items/${item.name.toLowerCase().replace(' ', '_')
		.replace('\'', '')})  
                |  [PokémonDB](http://pokemondb.net/item/${item.name.toLowerCase().replace(' ', '-')
		.replace('\'', '')})`)
				.setThumbnail(`https://play.pokemonshowdown.com/sprites/itemicons/${item.name.toLowerCase().replace(' ', '-')}.png`);

			return msg.embed(itemEmbed, `**${capitalizeFirstLetter(item.name)}**`);
		}
		const dym = match.get(args.item),
			dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the item name?';

		return msg.reply(`⚠ Item not found! ${dymString}`);

	}
};