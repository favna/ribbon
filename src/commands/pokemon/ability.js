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
 */

const Fuse = require('fuse.js'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {BattleAbilities} = require(path.join(__dirname, '../../data/dex/abilities')),
  {AbilityAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {oneLine} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class AbilityCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ability',
      memberName: 'ability',
      group: 'pokemon',
      aliases: ['abilities', 'abi'],
      description: 'Get the info on a Pokémon ability',
      format: 'AbilityName',
      examples: ['ability Multiscale'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'ability',
          prompt: 'Get info on which ability?',
          type: 'string',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  run (msg, {ability}) {
    startTyping(msg);
    /* eslint-disable sort-vars */
    const fsoptions = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['alias', 'ability', 'id', 'name']
      },
      aliasFuse = new Fuse(AbilityAliases, fsoptions),
      abilityFuse = new Fuse(BattleAbilities, fsoptions),
      aliasSearch = aliasFuse.search(ability),
      abilitySearch = aliasSearch.length ? abilityFuse.search(aliasSearch[0].ability) : abilityFuse.search(ability),
      abilityEmbed = new MessageEmbed();
    /* eslint-enable sort-vars */

    if (abilitySearch.length) {
      abilityEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosed.png')
        .addField('Description', abilitySearch[0].desc ? abilitySearch[0].desc : abilitySearch[0].shortDesc)
        .addField('External Resource', oneLine`
			[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(abilitySearch[0].name.replace(/ /g, '_'))}_(Ability\\))  
			|  [Smogon](http://www.smogon.com/dex/sm/abilities/${abilitySearch[0].name.toLowerCase().replace(/ /g, '_')})  
			|  [PokémonDB](http://pokemondb.net/ability/${abilitySearch[0].name.toLowerCase().replace(/ /g, '-')})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(abilityEmbed, `**${capitalizeFirstLetter(abilitySearch[0].name)}**`);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply('no ability found. Be sure it is an ability that has an effect in battles!');
  }
};