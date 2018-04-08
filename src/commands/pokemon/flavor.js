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
 * @file Pokémon FlavorCommand - Gets flavor text from a Pokémon  
 * Different forms are supported. Generally you want to write it all as 1 word with the form appended. For example `necrozmaduskmane` or `metagrossmega`  
 * Due to message limit size it fetches as many entries possible starting with generation 7 going downwards  
 * If you want to get the shiny sprite displayed add the `--shiny` at the end of the search  
 * **Aliases**: `flavors`, `dexdata`, `dexentries`, `dextext`, `dextex`, `dexter`
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @module
 * @category pokemon
 * @name flavor
 * @example flavor dragonite
 * @param {string} PokemonName The name of the pokemon you want to get flavor text for
 * @returns {MessageEmbed} Flavor texts for the pokemon
 */

/* eslint-disable max-statements */
const Matcher = require('did-you-mean'),
  commando = require('discord.js-commando'),
  dexEntries = require('../../data/dex/flavorText.json'),
  path = require('path'),
  underscore = require('underscore'),
  {MessageEmbed} = require('discord.js'),
  {BattleAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {BattlePokedex} = require(path.join(__dirname, '../../data/dex/pokedex')),
  {capitalizeFirstLetter, deleteCommandMessages} = require('../../util.js');

module.exports = class FlavorCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'flavor',
      'memberName': 'flavor',
      'group': 'pokemon',
      'aliases': ['flavors', 'dexentries', 'dextext', 'dextex'],
      'description': 'Get all the available dex entries for a Pokémon',
      'format': 'PokemonName',
      'examples': ['flavor Dragonite'],
      'guildOnly': false,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'pokemon',
          'prompt': 'Get info from which Pokémon?',
          'type': 'string',
          'parse': p => p.toLowerCase()
        }
      ]
    });

    this.pokedex = {};
    this.pokeAliases = {};
    this.match = [];
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

  run (msg, args) {
    const dataEmbed = new MessageEmbed(),
      pokedexEntries = [];

    let pokeEntry = {},
      totalEntriesLength = 0; 

    if (BattleAliases[args.pokemon]) {
      args.pokemon = BattleAliases[args.pokemon];
      this.match = new Matcher(Object.keys(BattleAliases).join(' '));
    } else {
      this.match = new Matcher(Object.keys(BattlePokedex).join(' '));
    }
  
    if (args.pokemon.split(' ')[0] === 'mega') {
      args.pokemon = `${args.pokemon.substring(args.pokemon.split(' ')[0].length + 1)}mega`;
    }
  
    if (/(?:--shiny)/i.test(args.pokemon)) {
      args.pokemon = (args.pokemon.substring(0, args.pokemon.indexOf('--shiny')) + args.pokemon.substring(args.pokemon.indexOf('--shiny') + '--shiny'.length)).replace(/ /g, '');
      args.shines = true;
    }
  
    pokeEntry = BattlePokedex[args.pokemon];
  
    for (const pokemon in BattlePokedex) {
      if (BattlePokedex[pokemon].num === parseInt(args.pokemon, 10) || BattlePokedex[pokemon].species.toLowerCase() === args.pokemon.toLowerCase()) {
        pokeEntry = BattlePokedex[pokemon];
        break;
      }
    }
      
    if (!underscore.isEmpty(pokeEntry)) {
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
        .setColor(this.fetchColor(pokeEntry.color))
        .setAuthor(`#${pokeEntry.num} - ${capitalizeFirstLetter(pokeEntry.species)}`, pokeEntry.num >= 1
          ? `https://cdn.rawgit.com/msikma/pokesprite/master/icons/pokemon/regular/${pokeEntry.species.replace(' ', '_').toLowerCase()}.png` : null)
        .setImage(pokeEntry.num === 0
          ? 'https://favna.xyz/images/ribbonhost/missingno.png'
          : `https://play.pokemonshowdown.com/sprites/${args.shines ? 'xyani-shiny' : 'xyani'}/${pokeEntry.species.toLowerCase().replace(' ', '')}.gif`)
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png')
        .setDescription('Dex entries throughout the games starting at the latest one. Possibly not listing all available due to 2000 characters limit.');

      deleteCommandMessages(msg, this.client);

      return msg.embed(dataEmbed);
    }
    const dym = this.match.get(args.pokemon), // eslint-disable-line one-var
      dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the Pokémon\'s name?';

    deleteCommandMessages(msg, this.client);

    return msg.reply(`Dex entry not found! ${dymString}`);
  }
};