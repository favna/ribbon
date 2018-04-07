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
const {MessageEmbed} = require('discord.js'),
  Matcher = require('did-you-mean'),
  commando = require('discord.js-commando'),
  dexEntries = require('../../data/dex/flavorText.json'),
  path = require('path'), 
  request = require('snekfetch'),
  requireFromURL = require('require-from-url/sync'),
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
          'type': 'string'
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

  async fetchDex () {
    if (Object.keys(this.pokedex).length !== 0) {
      return this.pokedex;
    }

    const dexData = await request.get(this.fetchLinks('dex'));

    if (dexData) {
      this.pokedex = requireFromURL(this.fetchLinks('dex')).BattlePokedex;
    } else {
      this.pokedex = require(path.join(__dirname, '../../data/dex/pokedex')).BattlePokedex; // eslint-disable-line global-require
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
      this.pokeAliases = require(path.join(__dirname, '../../data/dex/aliases')).BattlePokedex; // eslint-disable-line global-require
    }

    this.match = new Matcher(Object.keys(this.pokeAliases).join(' ')); // eslint-disable-line one-var

    return this.pokeAliases;
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
      dataEmbed = new MessageEmbed(),
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
        .setAuthor(`#${pokeEntry.num} - ${capitalizeFirstLetter(poke)}`,
          `https://cdn.rawgit.com/msikma/pokesprite/master/icons/pokemon/regular/${poke.replace(' ', '_').toLowerCase()}.png`)
        .setImage(`https://play.pokemonshowdown.com/sprites/xyani/${poke.toLowerCase().replace(' ', '')}.gif`)
        .setThumbnail('https://favna.xyz/images/ribbonhost/kalosdex.png')
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