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
 * @module
 * @category pokemon
 * @name flavor
 * @example flavor dragonite
 * @param {string} PokemonName The name of the pokemon you want to get flavor text for
 * @returns {MessageEmbed} Flavor texts for the pokemon
 */

/* eslint-disable max-statements */
const Fuse = require('fuse.js'),
  dexEntries = require('../../data/dex/flavorText.json'),
  path = require('path'),
  zalgo = require('to-zalgo'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {PokeAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {BattlePokedex} = require(path.join(__dirname, '../../data/dex/pokedex')),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class FlavorCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'flavor',
      memberName: 'flavor',
      group: 'pokemon',
      aliases: ['flavors', 'dexentries', 'dextext', 'dextex'],
      description: 'Get all the available dex entries for a Pokémon',
      format: 'PokemonName',
      examples: ['flavor Dragonite'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'pokemon',
          prompt: 'Get info from which Pokémon?',
          type: 'string',
          parse: p => p.toLowerCase()
        }
      ]
    });
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

  /* eslint-disable complexity, no-param-reassign*/
  run (msg, {pokemon, shines}) {
    startTyping(msg);
    if (/(?:--shiny)/i.test(pokemon)) {
      pokemon = (pokemon.substring(0, pokemon.indexOf('--shiny')) + pokemon.substring(pokemon.indexOf('--shiny') + '--shiny'.length)).replace(/ /g, '');
      shines = true;
    }
    if (pokemon.split(' ')[0] === 'mega') {
      pokemon = `${pokemon.substring(pokemon.split(' ')[0].length + 1)}mega`;
    }

    /* eslint-disable sort-vars */
    const aliasoptions = {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['alias']
      },
      pokeoptions = {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['num', 'species']
      },
      aliasFuse = new Fuse(PokeAliases, aliasoptions),
      pokeFuse = new Fuse(BattlePokedex, pokeoptions),
      firstSearch = pokeFuse.search(pokemon),
      aliasSearch = !firstSearch.length ? aliasFuse.search(pokemon) : null,
      pokeSearch = !firstSearch.length && aliasSearch.length ? pokeFuse.search(aliasSearch[0].name) : firstSearch,
      dataEmbed = new MessageEmbed(),
      pokedexEntries = [];
    /* eslint-enable sort-vars */

    let totalEntriesLength = 0;

    if (pokeSearch.length) {
      if (pokeSearch[0].forme) {
        for (let i = 0; i < dexEntries[`${pokeSearch[0].num}${pokeSearch[0].forme.toLowerCase()}`].length; i += 1) {
          pokedexEntries.push({
            game: dexEntries[`${pokeSearch[0].num}${pokeSearch[0].forme.toLowerCase()}`][i].version_id,
            text: dexEntries[`${pokeSearch[0].num}${pokeSearch[0].forme.toLowerCase()}`][i].flavor_text
          });
        }
      } else {
        for (let i = 0; i < dexEntries[pokeSearch[0].num].length; i += 1) {
          pokedexEntries.push({
            game: dexEntries[pokeSearch[0].num][i].version_id,
            text: dexEntries[pokeSearch[0].num][i].flavor_text
          });
        }
      }

      if (!pokedexEntries) {
        pokedexEntries.push({
          game: 'N.A.',
          text: '*PokéDex data not found for this Pokémon*'
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

      if (pokeSearch[0].num < 0) {
        pokeSearch[0].sprite = 'https://favna.xyz/images/ribbonhost/pokesprites/unknown.png';
      } else if (shines) {
        pokeSearch[0].sprite = `https://favna.xyz/images/ribbonhost/pokesprites/shiny/${pokeSearch[0].species.replace(' ', '_').toLowerCase()}.png`;
      } else {
        pokeSearch[0].sprite = `https://favna.xyz/images/ribbonhost/pokesprites/regular/${pokeSearch[0].species.replace(' ', '_').toLowerCase()}.png`;
      }

      dataEmbed
        .setColor(this.fetchColor(pokeSearch[0].color))
        .setAuthor(`#${pokeSearch[0].num} - ${capitalizeFirstLetter(pokeSearch[0].species)}`, pokeSearch[0].sprite)
        .setImage(`https://play.pokemonshowdown.com/sprites/${shines ? 'xyani-shiny' : 'xyani'}/${pokeSearch[0].species.toLowerCase().replace(' ', '')}.gif`)
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png')
        .setDescription('Dex entries throughout the games starting at the latest one. Possibly not listing all available due to 2000 characters limit.');

      if (pokeSearch[0].num === 0) {
        const fields = [];

        for (const field in dataEmbed.fields) {
          fields.push({
            name: zalgo(dataEmbed.fields[field].name),
            value: zalgo(dataEmbed.fields[field].value),
            inline: dataEmbed.fields[field].inline
          });
        }

        dataEmbed.description = zalgo(dataEmbed.description);
        dataEmbed.author.name = zalgo(dataEmbed.author.name);
        dataEmbed.setImage('https://favna.xyz/images/ribbonhost/missingno.png');
      }
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(dataEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('no Pokémon found.');
  }
};