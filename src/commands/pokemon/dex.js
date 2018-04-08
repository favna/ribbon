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
 * @author Jeroen Claassens (favna) <sharkie.jeroen@gmail.com>
 * @module
 * @category pokemon
 * @name dex
 * @example dex dragonite
 * @param {string} PokemonName The name of the pokemon you want to find
 * @returns {MessageEmbed} Lots of information about the pokemon
 */

const Matcher = require('did-you-mean'),
  commando = require('discord.js-commando'),
  dexEntries = require('../../data/dex/flavorText.json'),
  path = require('path'),
  underscore = require('underscore'),
  zalgo = require('to-zalgo'),
  {MessageEmbed} = require('discord.js'),
  {BattleAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {BattlePokedex} = require(path.join(__dirname, '../../data/dex/pokedex')),
  {oneLine} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages} = require('../../util.js');

module.exports = class DexCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'dex',
      'memberName': 'dex',
      'group': 'pokemon',
      'aliases': ['pokedex', 'dexfind', 'df', 'rotom', 'dexter', 'dexdata'],
      'description': 'Get the info on a Pokémon',
      'format': 'PokemonName',
      'examples': ['dex Dragonite'],
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

  /* eslint-disable max-statements, complexity */
  run (msg, args) {
    const dexEmbed = new MessageEmbed();
    let pokeEntry = {};

    if (/(?:--shiny)/i.test(args.pokemon)) {
      args.pokemon = (args.pokemon.substring(0, args.pokemon.indexOf('--shiny')) + args.pokemon.substring(args.pokemon.indexOf('--shiny') + '--shiny'.length)).replace(/ /g, '');
      args.shines = true;
    }

    if (BattleAliases[args.pokemon]) {
      args.pokemon = BattleAliases[args.pokemon];
      this.match = new Matcher(Object.keys(BattleAliases).join(' '));
    } else {
      this.match = new Matcher(Object.keys(BattlePokedex).join(' '));
    }

    if (args.pokemon.split(' ')[0] === 'mega') {
      args.pokemon = `${args.pokemon.substring(args.pokemon.split(' ')[0].length + 1)}mega`;
    }

    pokeEntry = BattlePokedex[args.pokemon];

    for (const pokemon in BattlePokedex) {
      if (BattlePokedex[pokemon].num === parseInt(args.pokemon, 10) || BattlePokedex[pokemon].species.toLowerCase() === args.pokemon.toLowerCase()) {
        pokeEntry = BattlePokedex[pokemon];
        break;
      }
    }

    if (!underscore.isEmpty(pokeEntry)) {
      const pokemon = {
        'abilities': '',
        'evos': `**${capitalizeFirstLetter(pokeEntry.species)}**`,
        'flavors': '*PokéDex data not found for this Pokémon*',
        'genders': '',
        'sprite': ''
      };

      if (pokeEntry.prevo) {
        pokemon.evos = `${capitalizeFirstLetter(pokeEntry.prevo)} > ${pokemon.evos}`;

        if (BattlePokedex[pokeEntry.prevo].prevo) {
          pokemon.evos = `${capitalizeFirstLetter(BattlePokedex[pokeEntry.prevo].prevo)} > ${pokemon.evos}`;
        }
      }

      if (pokeEntry.evos) {
        pokemon.evos = `${pokemon.evos} > ${pokeEntry.evos.map(entry => capitalizeFirstLetter(entry)).join(', ')}`;

        if (pokeEntry.evos.length === 1) {
          if (BattlePokedex[pokeEntry.evos[0]].evos) {
            pokemon.evos = `${pokemon.evos} > ${BattlePokedex[pokeEntry.evos[0]].evos.map(entry => capitalizeFirstLetter(entry)).join(', ')}`;
          }
        }
      }

      if (!pokeEntry.prevo && !pokeEntry.evos) {
        pokemon.evos += ' (No Evolutions)';
      }

      for (const ability in pokeEntry.abilities) {
        if (ability === '0') {
          pokemon.abilities += `${pokeEntry.abilities[ability]}`;
        } else if (ability === 'H') {
          pokemon.abilities += `, *${pokeEntry.abilities[ability]}*`;
        } else {
          pokemon.abilities += `, ${pokeEntry.abilities[ability]}`;
        }
      }

      switch (pokeEntry.gender) {
      case 'N':
        pokemon.genders = 'None';
        break;
      case 'M':
        pokemon.genders = '100% Male';
        break;
      case 'F':
        pokemon.genders = '100% Female';
        break;
      default:
        pokemon.genders = '50% Male | 50% Female';
        break;
      }

      if (pokeEntry.genderRatio) {
        pokemon.genders = `${pokeEntry.genderRatio.M * 100}% Male | ${pokeEntry.genderRatio.F * 100}% Female`;
      }

      if (pokeEntry.num >= 0) {
        if (pokeEntry.forme && dexEntries[`${pokeEntry.num}${pokeEntry.forme.toLowerCase()}`]) {
          pokemon.flavors = dexEntries[`${pokeEntry.num}${pokeEntry.forme.toLowerCase()}`][dexEntries[`${pokeEntry.num}${pokeEntry.forme.toLowerCase()}`].length - 1].flavor_text;
        } else {
          pokemon.flavors = dexEntries[pokeEntry.num][dexEntries[pokeEntry.num].length - 1].flavor_text;
        }
      }

      dexEmbed
        .setColor(this.fetchColor(pokeEntry.color))
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png');

      if (pokeEntry.num < 0) {
        pokemon.sprite = 'https://favna.xyz/images/ribbonhost/pokesprites/unknown.png';
      } else if (args.shines) {
        pokemon.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/shiny/${pokeEntry.species.replace(' ', '_').toLowerCase()}.png`;
      } else {
        pokemon.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/regular/${pokeEntry.species.replace(' ', '_').toLowerCase()}.png`;
      }

      dexEmbed
        .setAuthor(`#${pokeEntry.num} - ${capitalizeFirstLetter(pokeEntry.species)}`, pokemon.sprite)
        .setImage(`https://play.pokemonshowdown.com/sprites/${args.shines ? 'xyani-shiny' : 'xyani'}/${pokeEntry.species.toLowerCase().replace(' ', '')}.gif`)
        .addField('Type(s)', pokeEntry.types.join(', '), true)
        .addField('Height', `${pokeEntry.heightm}m`, true)
        .addField('Gender Ratio', pokemon.genders, true)
        .addField('Weight', `${pokeEntry.weightkg}kg`, true)
        .addField('Egg Groups', pokeEntry.eggGroups.join(', '), true)
        .addField('Abilities', pokemon.abilities, true);
      pokeEntry.otherFormes ? dexEmbed.addField('Other Formes', pokeEntry.otherFormes.join(', '), true) : null;
      dexEmbed
        .addField('Evolutionary Line', pokemon.evos, false)
        .addField('Base Stats', Object.keys(pokeEntry.baseStats).map(index => `${index.toUpperCase()}: **${pokeEntry.baseStats[index]}**`)
          .join(', '))
        .addField('PokéDex Data', pokemon.flavors)
        .addField('External Resource', oneLine`${pokeEntry.num >= 0 ? `
    [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(pokeEntry.species).replace(' ', '_')}_(Pokémon\\))`
          : '*Fan made Pokémon*'}
      ${pokeEntry.num >= 1 ? `  |  [Smogon](http://www.smogon.com/dex/sm/pokemon/${pokeEntry.species.replace(' ', '_')})  
      |  [PokémonDB](http://pokemondb.net/pokedex/${pokeEntry.species.replace(' ', '-')})` : ''}`);

      if (pokeEntry.num === 0) {
        const fields = [];

        for (const field in dexEmbed.fields) {
          fields.push({
            'name': zalgo(dexEmbed.fields[field].name),
            'value': zalgo(dexEmbed.fields[field].value),
            'inline': dexEmbed.fields[field].inline
          });
        }

        dexEmbed.fields = fields;
        dexEmbed.author.name = zalgo(dexEmbed.author.name);
        dexEmbed.setImage('https://favna.xyz/images/ribbonhost/missingno.png');
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(dexEmbed);
    }
    const dym = this.match.get(args.pokemon), // eslint-disable-line one-var
      dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the Pokémon\'s name?';

    deleteCommandMessages(msg, this.client);

    return msg.reply(`Dex entry not found! ${dymString}`);
  }
};