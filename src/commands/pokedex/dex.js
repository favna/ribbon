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
/* eslint-disable max-statements, complexity, one-var, vars-on-top, block-scoped-var, prefer-const, no-unused-vars, no-undef */

const Discord = require('discord.js'),
	Matcher = require('did-you-mean'),
	Path = require('path'),
	commando = require('discord.js-commando'),
	dex = require(Path.join(__dirname, 'data/pokedex.js')).BattlePokedex,
	dexEntries = require(Path.join(__dirname, 'data/flavorText.json')),
	{oneLine} = require('common-tags');


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
	match = new Matcher(Object.keys(dex).join(' '));


module.exports = class dexCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'dex',
			'group': 'pokedex',
			'aliases': ['pokedex', 'dexfind'],
			'memberName': 'dex',
			'description': 'Get the info on a Pokémon',
			'examples': ['dex {Pokemon Name}', 'dex Dragonite'],
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
	}

	run (msg, args) {

		let poke = args.pokemon.toLowerCase();
		const dexEmbed = new Discord.MessageEmbed();

		if (poke.split(' ')[0] === 'mega') {
			poke = `${poke.substring(poke.split(' ')[0].length + 1)}mega`;
		}
		let pokeEntry = dex[poke];

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
			let evoLine = `**${capitalizeFirstLetter(poke)}**`;
			let preEvos = '';

			if (pokeEntry.prevo) {
				preEvos = `${preEvos + capitalizeFirstLetter(pokeEntry.prevo)} > `;
				const preEntry = dex[pokeEntry.prevo];

				if (preEntry.prevo) {
					preEvos = `${capitalizeFirstLetter(preEntry.prevo)} > ${preEvos}`;
				}
				evoLine = preEvos + evoLine;
			}
			let evos = '';

			if (pokeEntry.evos) {
				evos = `${evos} > ${pokeEntry.evos.map(entry => capitalizeFirstLetter(entry)).join(', ')}`;
				if (pokeEntry.evos.length < 2) {
					const evoEntry = dex[pokeEntry.evos[0]];

					if (evoEntry.evos) {
						evos = `${evos} > ${evoEntry.evos.map(entry => capitalizeFirstLetter(entry)).join(', ')}`;
					}
				}
				evoLine += evos;
			}
			if (!pokeEntry.prevo && !pokeEntry.evos) {
				evoLine += ' (No Evolutions)';
			}
			let typestring = 'Type';

			if (pokeEntry.types.length > 1) {
				typestring += 's';
			}
			let abilityString = pokeEntry.abilities[0];

			for (let index = 1; index < Object.keys(pokeEntry.abilities).length; index += 1) {
				if (Object.keys(pokeEntry.abilities)[index] === 'H') {
					abilityString = `${abilityString}, *${pokeEntry.abilities.H}*`;
				} else {
					abilityString = `${abilityString}, ${pokeEntry.abilities[index]}`;
				}
			}

			for (let index = 0; index < dexEntries.length; index += 1) {
				if (dexEntries[index].species_id === pokeEntry.num) {
					let pokedexEntry = `*${dexEntries[index].flavor_text}*`;

					break;
				}
			}
			if (!pokedexEntry) {
				let pokedexEntry = '*PokéDex data not found for this Pokémon*';
			}

			dexEmbed
				.setColor(embedColours[pokeEntry.color])
				.setAuthor(`#${pokeEntry.num} - ${capitalizeFirstLetter(poke)}`, `https://cdn.rawgit.com/msikma/pokesprite/master/icons/pokemon/regular/${poke.replace(' ', '_').toLowerCase()}.png`)
				.addField(typestring, pokeEntry.types.join(', '), true)
				.addField('Abilities', abilityString, true)
				.addField('Height', `${pokeEntry.heightm}m`, true)
				.addField('Weight', `${pokeEntry.weightkg}kg`, true)
				.addField('Egg Groups', pokeEntry.eggGroups.join(', '), true);
			pokeEntry.otherFormes ? dexEmbed.addField('Other Formes', pokeEntry.otherFormes.join(', '), true) : null;
			dexEmbed
				.addField('Evolutionary Line', evoLine, false)
				.addField('Base Stats', Object.keys(pokeEntry.baseStats).map(index => `${index.toUpperCase()}: **${pokeEntry.baseStats[index]}**`)
					.join(', '))
				.addField('PokéDex Data', pokedexEntry)
				.addField('External Resource', oneLine `[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(poke).replace(' ', '_')}_(Pokémon\\))  
                |  [Smogon](http://www.smogon.com/dex/sm/pokemon/${poke.replace(' ', '_')})  
                |  [PokémonDB](http://pokemondb.net/pokedex/${poke.replace(' ', '-')})`)
				.setThumbnail(`https://play.pokemonshowdown.com/sprites/xyani/${poke.toLowerCase().replace(' ', '')}.gif`);

			return msg.embed(dexEmbed);
		}
		const dym = match.get(args.pokemon);
		const dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the Pokémon\'s name?';

		return msg.reply(`⚠ Dex entry not found! ${dymString}`);

	}
};