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

/* eslint-disable max-statements */

/* eslint-disable sort-vars */

const Discord = require('discord.js'),
	Matcher = require('did-you-mean'),
	commando = require('discord.js-commando'),
	path = require('path'),
	dexEntries = require(path.join(__dirname, 'data/flavorText.json')),
	request = require('snekfetch'),
	requireFromURL = require('require-from-url/sync');

/* eslint-enable sort-vars */

/* eslint-disable one-var */
const capitalizeFirstLetter = function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	embedColours = {
		'Red': 16724530,
		'Blue': 2456831,
		'Yellow': 16773977,
		'Green': 4128590,
		'Black': 3289650,
		'Brown': 10702874,
		'Purple': 10894824,
		'Gray': 9868950,
		'White': 14803425,
		'Pink': 16737701
	},
	links = {
		'aliases': 'https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/aliases.js',
		'dex': 'https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/pokedex.js'
	};

/* eslint-enable one-var */

module.exports = class flavorCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'flavor',
			'group': 'pokedex',
			'aliases': ['flavors', 'dexdata', 'dexentries', 'dextext', 'dextex', 'dexter'],
			'memberName': 'flavor',
			'description': 'Get all the available dex entries for a Pokémon',
			'examples': ['flavor {Pokemon Name}', 'flavor Dragonite'],
			'guildOnly': false,

			'args': [
				{
					'key': 'pokemon',
					'prompt': 'Get info from which Pokémon?',
					'type': 'string',
					'label': 'Pokemon to find'
				}
			]
		});

		this.pokedex = {};
		this.pokeAliases = {};
		this.match = [];
	}

	async fetchDex () {
		if (Object.keys(this.pokedex).length !== 0) {
			return this.pokedex;
		}

		const dexData = await request.get(links.dex);

		if (dexData) {
			this.pokedex = requireFromURL(links.dex).BattlePokedex;
		} else {
			this.pokedex = require(path.join(__dirname, 'data/pokedex.js')).BattlePokedex; // eslint-disable-line global-require
		}

		this.match = new Matcher(Object.keys(this.pokedex).join(' ')); // eslint-disable-line one-var

		return this.pokedex;
	}

	async fetchAliases () {
		if (Object.keys(this.pokeAliases).length !== 0) {
			return this.pokeAliases;
		}

		const dexData = await request.get(links.aliases);

		if (dexData) {
			this.pokeAliases = requireFromURL(links.aliases).BattleAliases;
		} else {
			this.pokeAliases = require(path.join(__dirname, 'data/aliases.js')).BattlePokedex; // eslint-disable-line global-require
		}

		this.match = new Matcher(Object.keys(this.pokeAliases).join(' ')); // eslint-disable-line one-var

		return this.pokeAliases;
	}

	async fetchImage (poke) {

		try {
			await request.get(`https://cdn.rawgit.com/110Percent/beheeyem-data/44795927/webp/${poke.toLowerCase().replace(' ', '_')}.webp`);
		} catch (err) {
			return `https://play.pokemonshowdown.com/sprites/xyani/${poke.toLowerCase().replace(' ', '')}.gif`;
		}

		return `https://cdn.rawgit.com/110Percent/beheeyem-data/44795927/webp/${poke.toLowerCase().replace(' ', '_')}.webp`;
	}

	async run (msg, args) {
		const aliases = await this.fetchAliases(),
			dataEmbed = new Discord.MessageEmbed(),
			dex = await this.fetchDex(),
			pokedexEntries = [];

		let poke = args.pokemon.toLowerCase(),
			totalEntriesLength = 0;

		if (aliases[poke]) {
			poke = aliases[poke];
		}

		poke = poke.toLowerCase();
		if (poke.split(' ')[0] === 'mega') {
			poke = `${poke.substring(poke.split(' ')[0].length + 1)}mega`;
		}
		let pokeEntry = dex[poke]; // eslint-disable-line one-var

		if (!pokeEntry) {
			for (let index = 0; index < Object.keys(dex).length; index += 1) {
				if (dex[Object.keys(dex)[index]].num === Number(poke)) {
					poke = dex[Object.keys(dex)[index]].species.toLowerCase();
					pokeEntry = dex[poke];
					break;
				}
			}
		}
		if (!pokeEntry) {
			for (let index = 0; index < Object.keys(dex).length; index += 1) {
				if (dex[Object.keys(dex)[index]].species.toLowerCase() === poke) {
					pokeEntry = dex[Object.keys(dex)[index]];
					break;
				}
			}
		}
		if (pokeEntry) {
			poke = pokeEntry.species;

			if (pokeEntry.forme) {
				for (let i = 0; i < dexEntries[`${pokeEntry.num}${pokeEntry.forme.toLowerCase()}`].length; i += 1) {
					pokedexEntries.push({
						'game': dexEntries[`${pokeEntry.num}${pokeEntry.forme.toLowerCase()}`][i].version_id,
						'text': dexEntries[`${pokeEntry.num}${pokeEntry.forme.toLowerCase()}`][i].flavor_text
					});
				}
			} else {
				for (let i = 0; i < dexEntries[pokeEntry.num].length; i += 1) {
					pokedexEntries.push({
						'game': dexEntries[pokeEntry.num][i].version_id,
						'text': dexEntries[pokeEntry.num][i].flavor_text
					});
				}
			}

			if (!pokedexEntries) {
				pokedexEntries.push({
					'game': 'N.A.',
					'text': '*PokéDex data not found for this Pokémon*'
				});
			}
			const imgURL = await this.fetchImage(poke);
			let i = pokedexEntries.length - 1;

			outer: do {
				dataEmbed.addField(pokedexEntries[i].game, pokedexEntries[i].text, false);
				for (let y = 0; y < dataEmbed.fields.length; y += 1) {
					totalEntriesLength += dataEmbed.fields[y].value.length;
					if (totalEntriesLength >= 2000) {
						break outer;
					}
				}
				i -= 1;
			} while (i !== -1);

			dataEmbed
				.setColor(embedColours[pokeEntry.color])
				.setFooter(`#${pokeEntry.num} - ${capitalizeFirstLetter(poke)}`, `https://cdn.rawgit.com/msikma/pokesprite/master/icons/pokemon/regular/${poke.replace(' ', '_').toLowerCase()}.png`)
				.setImage(imgURL)
				.setThumbnail('https://favna.s-ul.eu/LKL6cgin.png');

			return msg.embed(dataEmbed);
		}
		const dym = this.match.get(args.pokemon), // eslint-disable-line one-var
			dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the Pokémon\'s name?';

		return msg.reply(`⚠ Dex entry not found! ${dymString}`);
	}
};