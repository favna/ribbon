/**
 * @file Pokémon FlavorCommand - Gets flavor text from a Pokémon  
 * Different forms are supported. Generally you want to write it all as 1 word with the form appended. For example `necrozmaduskmane` or `metagrossmega`  
 * Due to message limit size it fetches as many entries possible starting with generation 7 going downwards  
 * If you want to get the shiny sprite displayed add the `--shiny` at the end of the search  
 * **Aliases**: `flavors`, `dexdata`, `dexentries`, `dextext`, `dextex`, `dexter`, `flavour`, `flavours`
 * @module
 * @category pokemon
 * @name flavor
 * @example flavor dragonite
 * @param {StringResolvable} PokemonName The name of the pokemon you want to get flavor text for
 * @returns {MessageEmbed} Flavor texts for the pokemon
 */

/* eslint-disable max-statements */
const Fuse = require('fuse.js'),
  dexEntries = require('../../data/dex/flavorText.json'),
  moment = require('moment'),
  path = require('path'),
  zalgo = require('to-zalgo'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {PokeAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {BattlePokedex} = require(path.join(__dirname, '../../data/dex/pokedex')),
  {stripIndents} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class FlavorCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'flavor',
      memberName: 'flavor',
      group: 'pokemon',
      aliases: ['flavors', 'dexentries', 'dextext', 'dextex', 'flavour', 'flavours'],
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

  /* eslint-disable complexity*/
  run (msg, {pokemon, shines}) {
    try {
      startTyping(msg);
      if ((/(?:--shiny)/i).test(pokemon)) {
        pokemon = (pokemon.substring(0, pokemon.indexOf('--shiny')) + pokemon.substring(pokemon.indexOf('--shiny') + '--shiny'.length)).replace(/ /g, '');
        shines = true;
      }
      if (pokemon.split(' ')[0] === 'mega') {
        pokemon = `${pokemon.substring(pokemon.split(' ')[0].length + 1)}mega`;
      }

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
        poke = pokeSearch[0],
        pokeData = {
          entries: [],
          sprite: ''
        };

      let totalEntriesLength = 0;

      if (poke.forme) {
        for (let i = 0; i < dexEntries[`${poke.num}${poke.forme.toLowerCase()}`].length; ++i) {
          pokeData.entries.push({
            game: dexEntries[`${poke.num}${poke.forme.toLowerCase()}`][i].version_id,
            text: dexEntries[`${poke.num}${poke.forme.toLowerCase()}`][i].flavor_text
          });
        }
      } else {
        for (let i = 0; i < dexEntries[poke.num].length; ++i) {
          pokeData.entries.push({
            game: dexEntries[poke.num][i].version_id,
            text: dexEntries[poke.num][i].flavor_text
          });
        }
      }

      if (!pokeData.entries.length) {
        pokeData.entries.push({
          game: 'N.A.',
          text: '*PokéDex data not found for this Pokémon*'
        });
      }
      let i = pokeData.entries.length - 1; // eslint-disable-line one-var

      outer: do {
        dataEmbed.addField(pokeData.entries[i].game, pokeData.entries[i].text, false);
        for (let y = 0; y < dataEmbed.fields.length; y += 1) {
          totalEntriesLength += dataEmbed.fields[y].value.length;
          if (totalEntriesLength >= 2000) {
            break outer;
          }
        }
        i -= 1;
      } while (i !== -1);

      if (poke.num < 0) {
        pokeData.sprite = 'https://favna.xyz/images/ribbonhost/pokesprites/unknown.png';
      } else if (shines) {
        pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/shiny/${poke.species.replace(/(%| )/g, '').toLowerCase()}.png`;
      } else {
        pokeData.sprite = `https://favna.xyz/images/ribbonhost/pokesprites/regular/${poke.species.replace(/(%| )/g, '').toLowerCase()}.png`;
      }

      dataEmbed
        .setColor(this.fetchColor(poke.color))
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosedv2.png')
        .setAuthor(`#${poke.num} - ${capitalizeFirstLetter(poke.species)}`, pokeData.sprite)
        .setImage(`https://play.pokemonshowdown.com/sprites/${shines ? 'xyani-shiny' : 'xyani'}/${poke.species.toLowerCase().replace(/(%| )/g, '')}.gif`)
        .setDescription('Dex entries throughout the games starting at the latest one. Possibly not listing all available due to 2000 characters limit.');

      if (poke.num === 0) {
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
        dataEmbed.fields = fields;
        dataEmbed.setImage('https://favna.xyz/images/ribbonhost/missingno.png');
      }
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(dataEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      if ((/(?:Cannot read property 'forme' of undefined|Cannot read property 'length' of undefined)/i).test(err.toString())) {
        return msg.reply(stripIndents`no Pokémon or flavor texts found for \`${pokemon}\``);
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`flavor\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** ${pokemon}
      **Shiny?:** ${shines ? 'yes' : 'no'}
      **Error Message:** ${err}
      `);

      return msg.reply(stripIndents`no Pokémon found for \`${pokemon}\`.
      If it was an error that occurred then I notified ${this.client.owners[0].username} about it
      and you can find out more by joining the support server using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
};