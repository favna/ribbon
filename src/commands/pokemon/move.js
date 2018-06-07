/**
 * @file Pokémon MoveCommand - Gets information about a move in Pokémon  
 * For move names existing of multiple words (for example `dragon dance`) you can either type it with or without the space  
 * **Aliases**: `attack`
 * @module
 * @category pokémon
 * @name move
 * @example move dragon dance
 * @param {StringResolvable} MoveName The move you want to find
 * @returns {MessageEmbed} Details about the move
 */

const Fuse = require('fuse.js'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {BattleMovedex} = require(path.join(__dirname, '../../data/dex/moves')),
  {MoveAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {oneLine} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class MoveCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'move',
      memberName: 'move',
      group: 'pokemon',
      aliases: ['attack'],
      description: 'Get the info on a Pokémon move',
      format: 'MoveName',
      examples: ['move Dragon Dance'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'move',
          prompt: 'Get info on which move?',
          type: 'string',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  run (msg, {move}) {
    startTyping(msg);
    /* eslint-disable sort-vars */
    const fsoptions = {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['alias', 'move', 'id', 'name']
      },
      aliasFuse = new Fuse(MoveAliases, fsoptions),
      moveFuse = new Fuse(BattleMovedex, fsoptions),
      aliasSearch = aliasFuse.search(move),
      moveSearch = aliasSearch.length ? moveFuse.search(aliasSearch[0].move) : moveFuse.search(move),
      moveEmbed = new MessageEmbed();
    /* eslint-enable sort-vars */

    if (moveSearch.length) {
      moveEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png')
        .addField('Description', moveSearch[0].desc ? moveSearch[0].desc : moveSearch[0].shortDesc)
        .addField('Type', moveSearch[0].type, true)
        .addField('Base Power', moveSearch[0].basePower, true)
        .addField('PP', moveSearch[0].pp, true)
        .addField('Category', moveSearch[0].category, true)
        .addField('Accuracy', typeof moveSearch[0].accuracy === 'boolean' ? 'Certain Success' : moveSearch[0].accuracy, true)
        .addField('Priority', moveSearch[0].priority, true)
        .addField('Target', moveSearch[0].target === 'normal' ? 'One Enemy' : capitalizeFirstLetter(moveSearch[0].target.replace(/([A-Z])/g, ' $1')), true)
        .addField('Contest Condition', moveSearch[0].contestType, true)
        .addField('Z-Crystal', moveSearch[0].isZ ? `${capitalizeFirstLetter(moveSearch[0].isZ.substring(0, moveSearch[0].isZ.length - 1))}Z` : 'None', true)
        .addField('External Resources', oneLine`
			[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${moveSearch[0].name.replace(/ /g, '_')}_(move\\))  
			|  [Smogon](http://www.smogon.com/dex/sm/moves/${moveSearch[0].name.replace(/ /g, '_')})  
			|  [PokémonDB](http://pokemondb.net/move/${moveSearch[0].name.replace(/ /g, '-')})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(moveEmbed, `**${capitalizeFirstLetter(moveSearch[0].name)}**`);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('no move found. Be sure it is a move that has an effect in battles!');
  }
};