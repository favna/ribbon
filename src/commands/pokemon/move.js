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
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {BattleMovedex} = require(path.join(__dirname, '../../data/dex/moves')),
  {MoveAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {oneLine, stripIndents} = require('common-tags'),
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
    try {
      startTyping(msg);
      const aliasOptions = {
          shouldSort: true,
          threshold: 0.2,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['alias', 'move']
        },
        moveOptions = {
          shouldSort: true,
          threshold: 0.2,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['id', 'name']
        },
        aliasFuse = new Fuse(MoveAliases, aliasOptions),
        moveFuse = new Fuse(BattleMovedex, moveOptions),
        aliasSearch = aliasFuse.search(move),
        moveSearch = aliasSearch.length ? moveFuse.search(aliasSearch[0].move) : moveFuse.search(move),
        moveEmbed = new MessageEmbed();

      moveEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosedv2.png')
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
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      if ((/(?:Cannot read property 'desc' of undefined)/i).test(err.toString())) {
        return msg.reply(stripIndents`no move found for \`${move}\``);
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`move\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** ${move}
      **Error Message:** ${err}
      `);

      return msg.reply(stripIndents`no move found for \`${move}\`. Be sure it is a move that has an effect in battles!
      If it was an error that occurred then I notified ${this.client.owners[0].username} about it
      and you can find out more by joining the support server using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
};