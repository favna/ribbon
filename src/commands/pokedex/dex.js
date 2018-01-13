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

/* eslint-disable max-statements, complexity */

/* eslint-disable sort-vars */

const Discord = require('discord.js'),
	Matcher = require('did-you-mean'),
	commando = require('discord.js-commando'),
	path = require('path'),
	dexEntries = require(path.join(__dirname, 'data/flavorText.json')),
	{oneLine} = require('common-tags'),
	request = require('snekfetch'),
	requireFromURL = require('require-from-url/sync');

/* eslint-enable sort-vars */

module.exports = class dexCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'dex',
			'group': 'pokedex',
			'aliases': ['pokedex', 'dexfind', 'df', 'rotom'],
			'memberName': 'dex',
			'description': 'Get the info on a Pokémon',
			'examples': ['dex {Pokemon Name}', 'dex Dragonite'],
			'guildOnly': false,

			'args': [
				{
					'key': 'pokemon',
					'prompt': 'Which Pokémon do you want to get info for?',
					'type': 'string',
					'label': 'Pokemon to find'
				}
			]
		});

		this.pokedex = {};
		this.pokeAliases = {};
		this.match = [];
	}

	capitalizeFirstLetter (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	fetchColor (col) {
		switch (col) {
			case 'Black':
				return '#323232';
			case 'Blue':
				return '#257CFF';
			case 'Brown':
				return '#A3501A';
			case 'Gray':
				return '#969696';
			case 'Green':
				return '#3EFF4E';
			case 'Pink':
				return '#FF65A5';
			case 'Purple':
				return '#A63DE8';
			case 'Red':
				return '#FF3232';
			case 'White':
				return '#E1E1E1';
			case 'Yellow':
				return '#FFF359';
			default:
				return '#FF0000';
		}
	}

	async fetchDex () {
		if (Object.keys(this.pokedex).length !== 0) {
			return this.pokedex;
		}

		const dexData = await request.get(this.fetchLinks('dex'));

		if (dexData) {
			this.pokedex = requireFromURL(this.fetchLinks('dex')).BattlePokedex;
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

		const dexData = await request.get(this.fetchLinks('aliases'));

		if (dexData) {
			this.pokeAliases = requireFromURL(this.fetchLinks('aliases')).BattleAliases;
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

	fetchLinks (type) {
		switch (type) {
			case 'aliases':
				return 'https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/aliases.js';
			case 'dex':
				return 'https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/pokedex.js';
			default:
				return 'error';
		}
	}

	async run (msg, args) {
		const aliases = await this.fetchAliases(),
			dex = await this.fetchDex(),
			dexEmbed = new Discord.MessageEmbed();

		let abilityString = '',
			evos = '',
			genderString = 'Not stored in PokéDex',
			poke = args.pokemon.toLowerCase(),
			pokedexEntry = 'Not stored in PokéDex',
			typestring = 'Not stored in PokéDex';

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
			let evoLine = `**${this.capitalizeFirstLetter(poke)}**`,
				preEvos = '';

			if (pokeEntry.prevo) {
				preEvos = `${preEvos + this.capitalizeFirstLetter(pokeEntry.prevo)} > `;
				const preEntry = dex[pokeEntry.prevo];

				if (preEntry.prevo) {
					preEvos = `${this.capitalizeFirstLetter(preEntry.prevo)} > ${preEvos}`;
				}
				evoLine = preEvos + evoLine;
			}
			evos = '';

			if (pokeEntry.evos) {
				evos = `${evos} > ${pokeEntry.evos.map(entry => this.capitalizeFirstLetter(entry)).join(', ')}`;
				if (pokeEntry.evos.length < 2) {
					const evoEntry = dex[pokeEntry.evos[0]];

					if (evoEntry.evos) {
						evos = `${evos} > ${evoEntry.evos.map(entry => this.capitalizeFirstLetter(entry)).join(', ')}`;
					}
				}
				evoLine += evos;
			}
			if (!pokeEntry.prevo && !pokeEntry.evos) {
				evoLine += ' (No Evolutions)';
			}
			typestring = 'Type';

			if (pokeEntry.types.length > 1) {
				typestring += 's';
			}
			abilityString = pokeEntry.abilities[0];

			for (let index = 1; index < Object.keys(pokeEntry.abilities).length; index += 1) {
				if (Object.keys(pokeEntry.abilities)[index] === 'H') {
					abilityString = `${abilityString}, *${pokeEntry.abilities.H}*`;
				} else {
					abilityString = `${abilityString}, ${pokeEntry.abilities[index]}`;
				}
			}

			if (pokeEntry.gender) {
				switch (pokeEntry.gender) {
					case 'N':
						genderString = 'None';
						break;
					case 'M':
						genderString = '100% Male';
						break;
					case 'F':
						genderString = '100% Female';
						break;
					default:
						genderString = '';
						break;
				}
			}

			if (pokeEntry.genderRatio) {
				genderString = `${pokeEntry.genderRatio.M * 100}% Male | ${pokeEntry.genderRatio.F * 100}% Female`;
			}

			if (pokeEntry.forme) {
				pokedexEntry = dexEntries[`${pokeEntry.num}${pokeEntry.forme.toLowerCase()}`][dexEntries[`${pokeEntry.num}${pokeEntry.forme.toLowerCase()}`].length - 1].flavor_text;
			} else {
				pokedexEntry = dexEntries[pokeEntry.num][dexEntries[pokeEntry.num].length - 1].flavor_text;
			}

			if (!pokedexEntry) {
				pokedexEntry = '*PokéDex data not found for this Pokémon*';
			}

			const imgURL = await this.fetchImage(poke);

			dexEmbed
				.setColor(this.fetchColor(pokeEntry.color))
				.setAuthor(`#${pokeEntry.num} - ${this.capitalizeFirstLetter(poke)}`,
					`https://cdn.rawgit.com/msikma/pokesprite/master/icons/pokemon/regular/${poke.replace(' ', '_').toLowerCase()}.png`)
				.setImage(imgURL)
				.setThumbnail('https://favna.s-ul.eu/LKL6cgin.png')
				.addField(typestring, pokeEntry.types.join(', '), true)
				.addField('Height', `${pokeEntry.heightm}m`, true)
				.addField('Gender Ratio', genderString, true)
				.addField('Weight', `${pokeEntry.weightkg}kg`, true)
				.addField('Egg Groups', pokeEntry.eggGroups.join(', '), true)
				.addField('Abilities', abilityString, true);
			pokeEntry.otherFormes ? dexEmbed.addField('Other Formes', pokeEntry.otherFormes.join(', '), true) : null;
			dexEmbed
				.addField('Evolutionary Line', evoLine, false)
				.addField('Base Stats', Object.keys(pokeEntry.baseStats).map(index => `${index.toUpperCase()}: **${pokeEntry.baseStats[index]}**`)
					.join(', '))
				.addField('PokéDex Data', pokedexEntry)
				.addField('External Resource', oneLine `[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${this.capitalizeFirstLetter(poke).replace(' ', '_')}_(Pokémon\\))  
			  |  [Smogon](http://www.smogon.com/dex/sm/pokemon/${poke.replace(' ', '_')})  
			  |  [PokémonDB](http://pokemondb.net/pokedex/${poke.replace(' ', '-')})`);

			this.deleteCommandMessages(msg);

			return msg.embed(dexEmbed);
		}
		const dym = this.match.get(args.pokemon), // eslint-disable-line one-var
			dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the Pokémon\'s name?';

		this.deleteCommandMessages(msg);

		return msg.reply(`⚠️ Dex entry not found! ${dymString}`);
	}
};