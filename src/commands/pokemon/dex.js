/**
 * @file Pokémon DexCommand - Gets information about a Pokémon from Dexter  
 * Different forms are supported. Generally you want to write it all as 1 word with the form appended. For example `necrozmaduskmane` or `metagrossmega`  
 * If you want to get the shiny sprite displayed add the `--shiny` at the end of the search  
 * **Aliases**: `pokedex`, `dexfind`, `df`, `rotom`
 * @module
 * @category pokemon
 * @name dex
 * @example dex dragonite
 * @param {StringResolvable} PokemonName The name of the pokemon you want to find
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
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

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

  /* eslint-disable max-statements, complexity */
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
        threshold: 0.2,
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

    if (pokeSearch.length) {
      const poke = pokeSearch[0],
        pokeData = {
          abilities: '',
          evos: `**${capitalizeFirstLetter(poke.species)}**`,
          flavors: '*PokéDex data not found for this Pokémon*',
          genders: '',
          sprite: ''
        };

      if (poke.prevo) {
        pokeData.evos = oneLine`${capitalizeFirstLetter(poke.prevo)} ${pokeFuse.search(poke.prevo)[0].evoLevel ? `(${pokeFuse.search(poke.prevo)[0].evoLevel})` : ''}
        → ${pokeData.evos} **(${poke.evoLevel})**`;
        
        if (pokeFuse.search(poke.prevo).length && pokeFuse.search(poke.prevo)[0].prevo) {
          pokeData.evos = `${capitalizeFirstLetter(pokeFuse.search(poke.prevo)[0].prevo)} → ${pokeData.evos}`;
        }
      }

      if (poke.evos) {
        pokeData.evos = oneLine`${pokeData.evos} → ${poke.evos.map(entry => `\`${capitalizeFirstLetter(entry)}\` *(${pokeFuse.search(entry)[0].evoLevel})*`).join(', ')} `;

        if (poke.evos.length === 1) {
          if (pokeFuse.search(poke.evos[0]).length && pokeFuse.search(poke.evos[0])[0].evos) {
            pokeData.evos = oneLine`${pokeData.evos}
            → ${pokeFuse.search(poke.evos[0])[0].evos.map(entry => `\`${capitalizeFirstLetter(entry)}\` *(${pokeFuse.search(entry)[0].evoLevel})*`).join(', ')}`;
          }
        }
      }

      if (!poke.prevo && !poke.evos) {
        pokeData.evos += ' (No Evolutions)';
      }

      for (const ability in poke.abilities) {
        if (ability === '0') {
          pokeData.abilities += `${poke.abilities[ability]}`;
        } else if (ability === 'H') {
          pokeData.abilities += `, *${poke.abilities[ability]}*`;
        } else {
          pokeData.abilities += `, ${poke.abilities[ability]}`;
        }
      }

      switch (poke.gender) {
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

      if (poke.genderRatio) {
        pokeData.genders = `${poke.genderRatio.M * 100}% Male | ${poke.genderRatio.F * 100}% Female`;
      }

      if (poke.num >= 0) {
        if (poke.forme && dexEntries[`${poke.num}${poke.forme.toLowerCase()}`]) {
          pokeData.flavors = dexEntries[`${poke.num}${poke.forme.toLowerCase()}`][dexEntries[`${poke.num}${poke.forme.toLowerCase()}`].length - 1].flavor_text;
        } else {
          pokeData.flavors = dexEntries[poke.num][dexEntries[poke.num].length - 1].flavor_text;
        }
      }

      dexEmbed
        .setColor(this.fetchColor(poke.color))
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png');

      if (poke.num < 0) {
        pokeData.sprite = 'https://favna.xyz/images/ribbonhost/pokesprites/unknown.png';
      } else if (shines) {
        pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/shiny/${poke.species.replace(/ /g, '').toLowerCase()}.png`;
      } else {
        pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/regular/${poke.species.replace(/ /g, '').toLowerCase()}.png`;
      }

      dexEmbed
        .setAuthor(`#${poke.num} - ${capitalizeFirstLetter(poke.species)}`, pokeData.sprite)
        .setImage(`https://play.pokemonshowdown.com/sprites/${shines ? 'xyani-shiny' : 'xyani'}/${poke.species.toLowerCase().replace(/ /g, '')}.gif`)
        .addField('Type(s)', poke.types.join(', '), true)
        .addField('Height', `${poke.heightm}m`, true)
        .addField('Gender Ratio', pokeData.genders, true)
        .addField('Weight', `${poke.weightkg}kg`, true)
        .addField('Egg Groups', poke.eggGroups.join(', '), true)
        .addField('Abilities', pokeData.abilities, true);
      poke.otherFormes ? dexEmbed.addField('Other Formes', poke.otherFormes.join(', '), true) : null;
      dexEmbed
        .addField('Evolutionary Line', pokeData.evos, false)
        .addField('Base Stats', Object.keys(poke.baseStats).map(index => `${index.toUpperCase()}: **${poke.baseStats[index]}**`)
          .join(', '))
        .addField('PokéDex Data', pokeData.flavors)
        .addField('External Resource', oneLine`${poke.num >= 0 ? `
    [Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(poke.species).replace(/ /g, '_')}_(Pokémon\\))`
          : '*Fan made Pokémon*'}
      ${poke.num >= 1 ? `  |  [Smogon](http://www.smogon.com/dex/sm/pokemon/${poke.species.replace(/ /g, '_')})  
      |  [PokémonDB](http://pokemondb.net/pokedex/${poke.species.replace(/ /g, '-')})` : ''}`);

      if (poke.num === 0) {
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