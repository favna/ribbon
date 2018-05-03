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
 * @file Pokémon DexCommand - Gets information about a Pokémon from Dexter  
 * Different forms are supported. Generally you want to write it all as 1 word with the form appended. For example `necrozmaduskmane` or `metagrossmega`  
 * If you want to get the shiny sprite displayed add the `--shiny` at the end of the search  
 * **Aliases**: `pokedex`, `dexfind`, `df`, `rotom`
 * @module
 * @category pokemon
 * @name dex
 * @example dex dragonite
 * @param {string} PokemonName The name of the pokemon you want to find
 * @returns {MessageEmbed} Lots of information about the pokemon
 */

const Fuse = require('fuse.js'),
  dexEntries = require('../../data/dex/flavorText.json'),
  path = require('path'),
  zalgo = require('to-zalgo'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {PokeAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {BattlePokedex} = require(path.join(__dirname, '../../data/dex/pokedex')),
  {oneLine} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class DexCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dex',
      memberName: 'dex',
      group: 'pokemon',
      aliases: ['pokedex', 'dexfind', 'df', 'rotom', 'dexter', 'dexdata'],
      description: 'Get the info on a Pokémon',
      format: 'PokemonName',
      examples: ['dex Dragonite'],
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

  /* eslint-disable max-statements, complexity, no-param-reassign */
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
      dexEmbed = new MessageEmbed();
    /* eslint-enable sort-vars */

    /*
     * aliasSearch = aliasFuse.search(pokemon),
     * pokeSearch = aliasSearch.length ? pokeFuse.search(aliasSearch[0].name) : pokeFuse.search(pokemon),
     */

    if (pokeSearch.length) {
      const pokeData = {
        abilities: '',
        evos: `**${capitalizeFirstLetter(pokeSearch[0].species)}**`,
        flavors: '*PokéDex data not found for this Pokémon*',
        genders: '',
        sprite: ''
      };

      if (pokeSearch[0].prevo) {
        pokeData.evos = `${capitalizeFirstLetter(pokeSearch[0].prevo)} > ${pokeData.evos}`;

        if (pokeFuse.search(pokeSearch[0].prevo).length && pokeFuse.search(pokeSearch[0].prevo)[0].prevo) {
          pokeData.evos = `${capitalizeFirstLetter(pokeFuse.search(pokeSearch[0].prevo)[0].prevo)} > ${pokeData.evos}`;
        }
      }

      if (pokeSearch[0].evos) {
        pokeData.evos = `${pokeData.evos} > ${pokeSearch[0].evos.map(entry => capitalizeFirstLetter(entry)).join(', ')}`;

        if (pokeSearch[0].evos.length === 1) {
          if (pokeFuse.search(pokeSearch[0].evos[0]).length && pokeFuse.search(pokeSearch[0].evos[0])[0].evos) {
            pokeData.evos = `${pokeData.evos} > ${pokeFuse.search(pokeSearch[0].evos[0])[0].evos.map(entry => capitalizeFirstLetter(entry)).join(', ')}`;
          }
        }
      }

      if (!pokeSearch[0].prevo && !pokeSearch[0].evos) {
        pokeData.evos += ' (No Evolutions)';
      }

      for (const ability in pokeSearch[0].abilities) {
        if (ability === '0') {
          pokeData.abilities += `${pokeSearch[0].abilities[ability]}`;
        } else if (ability === 'H') {
          pokeData.abilities += `, *${pokeSearch[0].abilities[ability]}*`;
        } else {
          pokeData.abilities += `, ${pokeSearch[0].abilities[ability]}`;
        }
      }

      switch (pokeSearch[0].gender) {
      case 'N':
        pokeData.genders = 'None';
        break;
      case 'M':
        pokeData.genders = '100% Male';
        break;
      case 'F':
        pokeData.genders = '100% Female';
        break;
      default:
        pokeData.genders = '50% Male | 50% Female';
        break;
      }

      if (pokeSearch[0].genderRatio) {
        pokeData.genders = `${pokeSearch[0].genderRatio.M * 100}% Male | ${pokeSearch[0].genderRatio.F * 100}% Female`;
      }

      if (pokeSearch[0].num >= 0) {
        if (pokeSearch[0].forme && dexEntries[`${pokeSearch[0].num}${pokeSearch[0].forme.toLowerCase()}`]) {
          pokeData.flavors = dexEntries[`${pokeSearch[0].num}${pokeSearch[0].forme.toLowerCase()}`][dexEntries[`${pokeSearch[0].num}${pokeSearch[0].forme.toLowerCase()}`].length - 1].flavor_text;
        } else {
          pokeData.flavors = dexEntries[pokeSearch[0].num][dexEntries[pokeSearch[0].num].length - 1].flavor_text;
        }
      }

      dexEmbed
        .setColor(this.fetchColor(pokeSearch[0].color))
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png');

      if (pokeSearch[0].num < 0) {
        pokeData.sprite = 'https://favna.xyz/images/ribbonhost/pokesprites/unknown.png';
      } else if (shines) {
        pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/shiny/${pokeSearch[0].species.replace(/ /g, '_').toLowerCase()}.png`;
      } else {
        pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/regular/${pokeSearch[0].species.replace(/ /g, '_').toLowerCase()}.png`;
      }

      dexEmbed
        .setAuthor(`#${pokeSearch[0].num} - ${capitalizeFirstLetter(pokeSearch[0].species)}`, pokeData.sprite)
        .setImage(`https://play.pokemonshowdown.com/sprites/${shines ? 'xyani-shiny' : 'xyani'}/${pokeSearch[0].species.toLowerCase().replace(/ /g, '')}.gif`)
        .addField('Type(s)', pokeSearch[0].types.join(', '), true)
        .addField('Height', `${pokeSearch[0].heightm}m`, true)
        .addField('Gender Ratio', pokeData.genders, true)
        .addField('Weight', `${pokeSearch[0].weightkg}kg`, true)
        .addField('Egg Groups', pokeSearch[0].eggGroups.join(', '), true)
        .addField('Abilities', pokeData.abilities, true);
      pokeSearch[0].otherFormes ? dexEmbed.addField('Other Formes', pokeSearch[0].otherFormes.join(', '), true) : null;
      dexEmbed
        .addField('Evolutionary Line', pokeData.evos, false)
        .addField('Base Stats', Object.keys(pokeSearch[0].baseStats).map(index => `${index.toUpperCase()}: **${pokeSearch[0].baseStats[index]}**`)
          .join(', '))
        .addField('PokéDex Data', pokeData.flavors)
        .addField('External Resource', oneLine`${pokeSearch[0].num >= 0 ? `
    [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(pokeSearch[0].species).replace(/ /g, '_')}_(Pokémon\\))`
          : '*Fan made Pokémon*'}
      ${pokeSearch[0].num >= 1 ? `  |  [Smogon](http://www.smogon.com/dex/sm/pokemon/${pokeSearch[0].species.replace(/ /g, '_')})  
      |  [PokémonDB](http://pokemondb.net/pokedex/${pokeSearch[0].species.replace(/ /g, '-')})` : ''}`);

      if (pokeSearch[0].num === 0) {
        const fields = [];

        for (const field in dexEmbed.fields) {
          fields.push({
            name: zalgo(dexEmbed.fields[field].name),
            value: zalgo(dexEmbed.fields[field].value),
            inline: dexEmbed.fields[field].inline
          });
        }

        dexEmbed.fields = fields;
        dexEmbed.author.name = zalgo(dexEmbed.author.name);
        dexEmbed.setImage('https://favna.xyz/images/ribbonhost/missingno.png');
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(dexEmbed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('no Pokémon not found.');
  }
};