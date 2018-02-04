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

/* eslint-disable sort-vars */
const Discord = require('discord.js'),
	Matcher = require('did-you-mean'),
	path = require('path'),
	commando = require('discord.js-commando'),
	{oneLine} = require('common-tags'),
	request = require('snekfetch'),
	requireFromURL = require('require-from-url/sync'),
	{capitalizeFirstLetter, deleteCommandMessages} = require('../../util.js');
/* eslint-enable sort-vars */

module.exports = class abilityCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'ability',
			'memberName': 'ability',
			'group': 'pokedex',
			'aliases': ['abilities', 'abi'],
			'description': 'Get the info on a Pokémon ability',
			'format': 'AbilityName',
			'examples': ['ability Multiscale'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'ability',
					'prompt': 'Get info on which ability?',
					'type': 'string'
				}
			]
		});

		this.abilities = {};
		this.pokeAliases = {};
		this.match = [];
	}

	async fetchAbilities () {
		if (Object.keys(this.abilities).length !== 0) {
			return this.abilities;
		}

		const abilityData = await request.get(this.fetchLinks('abilities'));

		if (abilityData) {
			this.abilities = requireFromURL(this.fetchLinks('abilities')).BattleAbilities;
		} else {
			this.abilities = require(path.join(__dirname, 'data/abilities.js')).BattleAbilities; // eslint-disable-line global-require
		}
		this.match = new Matcher(Object.keys(this.abilities).join(' ')); // eslint-disable-line one-var

		return this.abilities;
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

	fetchLinks (type) {
		switch (type) {
			case 'abilities':
				return 'https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/abilities.js';
			case 'aliases':
				return 'https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/aliases.js';
			default:
				return 'error';
		}
	}

	async run (msg, args) {

		const abilities = await this.fetchAbilities(),
			abilityEmbed = new Discord.MessageEmbed(),
			aliases = await this.fetchAliases();

		let ability = {},
			abilityName = args.ability.toLowerCase();

		if (aliases[abilityName]) {
			abilityName = aliases[abilityName];
		}

		abilityName = abilityName.toLowerCase();

		for (let i = 0; i < Object.keys(abilities).length; i += 1) {
			if (abilities[Object.keys(abilities)[i]].name.toLowerCase() === abilityName) {
				ability = abilities[Object.keys(abilities)[i]];

				break;
			}
		}

		if (ability) {
			abilityEmbed
				.setColor('#E24141')
				.setThumbnail('https://favna.s-ul.eu/LKL6cgin.png')
				.addField('Description', ability.desc ? ability.desc : ability.shortDesc)
				.addField('External Resource', oneLine `
			[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(ability.name.replace(' ', '_'))}_(Ability\\))  
			|  [Smogon](http://www.smogon.com/dex/sm/abilities/${ability.name.toLowerCase().replace(' ', '_')})  
			|  [PokémonDB](http://pokemondb.net/ability/${ability.name.toLowerCase().replace(' ', '-')})`);

			deleteCommandMessages(msg, this.client);

			return msg.embed(abilityEmbed, `**${capitalizeFirstLetter(ability.name)}**`);
		}
		const dym = this.match.get(args.ability), // eslint-disable-line one-var
			dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the ability?';

		deleteCommandMessages(msg, this.client);

		return msg.reply(`⚠️ Ability not found! ${dymString}`);
	}
};