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
 * @file Pokémon MoveCommand - Gets information about a move in Pokémon  
 * For move names existing of multiple words (for example `dragon dance`) you can either type it with or without the space  
 * **Aliases**: `attack`
 * @module
 * @category pokémon
 * @name move
 * @example move dragon dance
 * @param {string} MoveName The move you want to find
 * @returns {MessageEmbed} Details about the move
 *
 * @todo Implement FuseJS in Move
 * @body FuseJS will take away the need to use matcher and allow for far more consistent results
 */

const Matcher = require('did-you-mean'),
  path = require('path'),
  underscore = require('underscore'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {BattleMovedex} = require(path.join(__dirname, '../../data/dex/moves')),
  {MoveAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {oneLine} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class MoveCommand extends Command {
  constructor (client) {
    super(client, {
      'name': 'move',
      'memberName': 'move',
      'group': 'pokemon',
      'aliases': ['attack'],
      'description': 'Get the info on a Pokémon move',
      'format': 'MoveName',
      'examples': ['move Dragon Dance'],
      'guildOnly': false,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'move',
          'prompt': 'Get info on which move?',
          'type': 'string',
          'parse': p => p.toLowerCase()
        }
      ]
    });

    this.match = [];
  }

  run (msg, args) {
    startTyping(msg);
    const moveEmbed = new MessageEmbed();

    let moveEntry = {};

    if (MoveAliases[args.move]) {
      args.item = MoveAliases[args.item];
      this.match = new Matcher(Object.keys(MoveAliases).join(' '));
    } else {
      this.match = new Matcher(Object.keys(BattleMovedex).join(' '));
    }

    moveEntry = BattleMovedex[args.move];

    for (const move in BattleMovedex) {
      if (BattleMovedex[move].id.toLowerCase() === args.move.toLowerCase() || BattleMovedex[move].name.toLowerCase() === args.move.toLowerCase() || BattleMovedex[move].num.toString() === args.move) {
        moveEntry = BattleMovedex[move];
        break;
      }
    }

    if (!underscore.isEmpty(moveEntry)) {
      moveEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png')
        .addField('Description', moveEntry.desc ? moveEntry.desc : moveEntry.shortDesc)
        .addField('Type', moveEntry.type, true)
        .addField('Base Power', moveEntry.basePower, true)
        .addField('PP', moveEntry.pp, true)
        .addField('Category', moveEntry.category, true)
        .addField('Accuracy', moveEntry.accuracy ? 'Certain Success' : moveEntry.accuracy, true)
        .addField('Priority', moveEntry.priority, true)
        .addField('Target', moveEntry.target === 'normal' ? 'One Enemy' : capitalizeFirstLetter(moveEntry.target.replace(/([A-Z])/g, ' $1')), true)
        .addField('Contest Condition', moveEntry.contestType, true)
        .addField('Z-Crystal', moveEntry.isZ ? `${capitalizeFirstLetter(moveEntry.isZ.substring(0, moveEntry.isZ.length - 1))}Z` : 'None', true)
        .addField('External Resources', oneLine`
			[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${moveEntry.name.replace(' ', '_')}_(move\\))  
			|  [Smogon](http://www.smogon.com/dex/sm/moves/${moveEntry.name.replace(' ', '_')})  
			|  [PokémonDB](http://pokemondb.net/move/${moveEntry.name.replace(' ', '-')})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(moveEmbed, `**${capitalizeFirstLetter(moveEntry.name)}**`);
    }
    this.match.setThreshold(4);
    const dym = this.match.get(args.move), // eslint-disable-line one-var
      dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the move name?';

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.channel.send(`Move not found! ${dymString}`);
  }
};