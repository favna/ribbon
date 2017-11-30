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
	abilities = require(Path.join(__dirname, 'data/abilities.js')).BattleAbilities,
	commando = require('discord.js-commando'),
	{oneLine} = require('common-tags');

const capitalizeFirstLetter = function (string) { // eslint-disable-line one-var
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	match = new Matcher(Object.keys(abilities).join(' '));

module.exports = class abilityCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'ability',
			'group': 'pokedex',
			'aliases': ['abilities', 'abi'],
			'memberName': 'ability',
			'description': 'Get the info on a Pokémon ability',
			'examples': ['ability {ability name}', 'ability Multiscale'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			
			'args': [
				{
					'key': 'ability',
					'prompt': 'Get info on which ability?',
					'type': 'string',
					'label': 'Ability to find'
				}
			]
		});
	}

	run (msg, args) {
		let ability = {};
		const abilityEmbed = new Discord.MessageEmbed();

		for (let index = 0; index < Object.keys(abilities).length; index += 1) {
			if (abilities[Object.keys(abilities)[index]].name.toLowerCase() === args.ability.toLowerCase()) {
				ability = abilities[Object.keys(abilities)[index]];
				break;
			}
		}

		if (ability) {
			abilityEmbed
				.setColor('#0088FF')
				.addField('Description', ability.desc ? ability.desc : ability.shortDesc)
				.addField('External Resource', oneLine `
                [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(ability.name.replace(' ', '_'))}_(Ability\\))  
                |  [Smogon](http://www.smogon.com/dex/sm/abilities/${ability.name.toLowerCase().replace(' ', '_')})  
                |  [PokémonDB](http://pokemondb.net/ability/${ability.name.toLowerCase().replace(' ', '-')})`);

			return msg.embed(abilityEmbed, `**${capitalizeFirstLetter(ability.name)}**`);
		}
		const dym = match.get(args.ability), // eslint-disable-line one-var
			dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the ability?';

		return msg.reply(`⚠️ Ability not found! ${dymString}`);
	}
};