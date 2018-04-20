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
 * @file Pokémon AbilityCommand - Gets information on an ability in Pokémon  
 * **Aliases**: `abilities`, `abi`
 * @module
 * @category pokémon
 * @name ability
 * @example ability multiscale
 * @param {string} AbilityName The name of the ability you  want to find
 * @returns {MessageEmbed} Description and external links for the ability
 *
 * @todo Implement FuseJS in Ability
 * @body FuseJS will take away the need to use matcher and allow for far more consistent results
 */

const Matcher = require('did-you-mean'),
  commando = require('discord.js-commando'),
  path = require('path'),
  underscore = require('underscore'),
  {MessageEmbed} = require('discord.js'),
  {BattleAbilities} = require(path.join(__dirname, '../../data/dex/abilities')),
  {AbilityAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {oneLine} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages} = require('../../util.js');

module.exports = class AbilityCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'ability',
      'memberName': 'ability',
      'group': 'pokemon',
      'aliases': ['abilities', 'abi'],
      'description': 'Get the info on a Pokémon ability',
      'format': 'AbilityName',
      'examples': ['ability Multiscale'],
      'guildOnly': false,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'ability',
          'prompt': 'Get info on which ability?',
          'type': 'string',
          'parse': p => p.toLowerCase()
        }
      ]
    });

    this.match = [];
  }

  run (msg, args) {
    const abilityEmbed = new MessageEmbed();

    let abilityEntry = {};

    if (AbilityAliases[args.ability]) {
      args.ability = AbilityAliases[args.ability];
      this.match = new Matcher(Object.keys(AbilityAliases).join(' '));
    } else {
      this.match = new Matcher(Object.keys(BattleAbilities).join(' '));
    }

    for (const ability in BattleAbilities) {
      if (BattleAbilities[ability].name.toLowerCase() === args.ability.toLowerCase()) {
        abilityEntry = BattleAbilities[ability];
        break;
      }
    }

    if (!underscore.isEmpty(abilityEntry)) {
      abilityEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#2255EE')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png')
        .addField('Description', abilityEntry.desc ? abilityEntry.desc : abilityEntry.shortDesc)
        .addField('External Resource', oneLine`
			[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(abilityEntry.name.replace(' ', '_'))}_(Ability\\))  
			|  [Smogon](http://www.smogon.com/dex/sm/abilities/${abilityEntry.name.toLowerCase().replace(' ', '_')})  
			|  [PokémonDB](http://pokemondb.net/ability/${abilityEntry.name.toLowerCase().replace(' ', '-')})`);

      deleteCommandMessages(msg, this.client);

      return msg.embed(abilityEmbed, `**${capitalizeFirstLetter(abilityEntry.name)}**`);
    }
    this.match.setThreshold(4);
    const dym = this.match.get(args.ability), // eslint-disable-line one-var
      dymString = dym !== null ? `Did you mean \`${dym}\`?` : 'Maybe you misspelt the ability?';

    deleteCommandMessages(msg, this.client);

    return msg.reply(`ability not found! ${dymString}`);
  }
};