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
 * Gets the type matchup of any 1 or 2 types  
 * **Aliases**: `matchup`, `weakness`, `advantage`
 * @module
 * @category pokémon
 * @name type
 * @example type dragon flying
 * @param {string} Types One or two types to find the matchup for
 * @returns {MessageEmbed} All weaknesses, advantages
 */

/* eslint-disable max-statements, complexity, block-scoped-var, vars-on-top, one-var, no-var, no-redeclare, max-depth, init-declarations */

const {MessageEmbed} = require('discord.js'),
  commando = require('discord.js-commando'),
  typeMatchups = require('../../data/dex/typechart').BattleTypeChart, 
  {oneLine} = require('common-tags'), 
  {capitalizeFirstLetter, deleteCommandMessages} = require('../../util.js');

module.exports = class typeCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'type',
      'memberName': 'type',
      'group': 'pokemon',
      'aliases': ['matchup', 'weakness', 'advantage'],
      'description': 'Get type matchup for a given type or type combination',
      'format': 'FirstType [SecondType]',
      'examples': ['type Dragon Flying'],
      'guildOnly': false,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'type',
          'prompt': 'Get info on which type?',
          'type': 'string'
        }
      ]
    });
  }

  run (msg, args) {
    const atkMulti = {
        'Bug': 1,
        'Dark': 1,
        'Dragon': 1,
        'Electric': 1,
        'Fairy': 1,
        'Fighting': 1,
        'Fire': 1,
        'Flying': 1,
        'Ghost': 1,
        'Grass': 1,
        'Ground': 1,
        'Ice': 1,
        'Normal': 1,
        'Poison': 1,
        'Psychic': 1,
        'Rock': 1,
        'Steel': 1,
        'Water': 1
      },
      atkNoRaw = [],
      atkNoTypes = [],
      atkNormalRaw = [],
      atkNormalTypes = [],
      atkResistRaw = [],
      atkResistTypes = [],
      atkVulnDisplay = [],
      atkVulnRaw = [],
      atkVulnTypes = [],
      defMulti = {
        'Bug': 1,
        'Dark': 1,
        'Dragon': 1,
        'Electric': 1,
        'Fairy': 1,
        'Fighting': 1,
        'Fire': 1,
        'Flying': 1,
        'Ghost': 1,
        'Grass': 1,
        'Ground': 1,
        'Ice': 1,
        'Normal': 1,
        'Poison': 1,
        'Psychic': 1,
        'Rock': 1,
        'Steel': 1,
        'Water': 1
      },
      displayTypes = [],
      noRaw = [],
      noTypes = [],
      normalRaw = [],
      normalTypes = [],
      resistRaw = [],
      resistTypes = [],
      typeEmbed = new MessageEmbed(),
      vulnDisplay = [],
      vulnRaw = [],
      vulnTypes = [];

    let atkNoCheck = false,
      atkNormalCheck = false,
      atkResistCheck = false,
      atkVulnCheck = false,
      noCheck = false,
      normalCheck = false,
      resistCheck = false,
      vulnCheck = false;

    for (let z = 0; z < args.type.split(' ').length; z += 1) {
      const argsSplit = args.type.split(' ')[z];

      if (Object.keys(typeMatchups).map(c => c.toLowerCase())
        .indexOf(argsSplit.toLowerCase()) !== -1) {
        const toType = capitalizeFirstLetter(argsSplit);

        displayTypes.push(toType);
        const dTaken = typeMatchups[toType].damageTaken;
        var toMatch;

        for (toMatch in dTaken) {
          if (defMulti[toMatch]) {
            if (dTaken[toMatch] === 1) {
              defMulti[toMatch] *= 2;
            } else if (dTaken[toMatch] === 2) {
              defMulti[toMatch] *= 0.5;
            } else if (dTaken[toMatch] === 3) {
              defMulti[toMatch] = 0;
            }
          }
        }
        for (toMatch in typeMatchups) {
          if (atkMulti[toMatch]) {
            if (typeMatchups[toMatch].damageTaken[toType] === 1) {
              atkMulti[toMatch] *= 2;
            } else if (typeMatchups[toMatch].damageTaken[toType] === 2) {
              atkMulti[toMatch] *= 0.5;
            } else if (typeMatchups[toMatch].damageTaken[toType] === 3) {
              atkMulti[toMatch] *= 0;
            }
          }
        }
        for (var i = 0; i < Object.keys(defMulti).length; i += 1) {
          if (defMulti[Object.keys(defMulti)[i]] > 1) {
            vulnCheck = true;
            break;
          }
        }
        for (var i = 0; i < Object.keys(defMulti).length; i += 1) {
          if (defMulti[Object.keys(defMulti)[i]] === 1) {
            normalCheck = true;
            break;
          }
        }
        for (var i = 0; i < Object.keys(defMulti).length; i += 1) {
          if (defMulti[Object.keys(defMulti)[i]] > 0 && defMulti[Object.keys(defMulti)[i]] < 1) {
            resistCheck = true;
            break;
          }
        }
        for (var i = 0; i < Object.keys(defMulti).length; i += 1) {
          if (defMulti[Object.keys(defMulti)[i]] === 0) {
            noCheck = true;
            break;
          }
        }
        for (var i = 0; i < Object.keys(atkMulti).length; i += 1) {
          if (atkMulti[Object.keys(atkMulti)[i]] > 1) {
            atkVulnCheck = true;
            break;
          }
        }
        for (var i = 0; i < Object.keys(atkMulti).length; i += 1) {
          if (atkMulti[Object.keys(atkMulti)[i]] === 1) {
            atkNormalCheck = true;
            break;
          }
        }
        for (var i = 0; i < Object.keys(atkMulti).length; i += 1) {
          if (atkMulti[Object.keys(atkMulti)[i]] > 0 && atkMulti[Object.keys(atkMulti)[i]] < 1) {
            atkResistCheck = true;
            break;
          }
        }
        for (var i = 0; i < Object.keys(atkMulti).length; i += 1) {
          if (atkMulti[Object.keys(atkMulti)[i]] === 0) {
            atkNoCheck = true;
            break;
          }
        }
      }
    }
    if (vulnCheck) {
      for (var i = 0; i < Object.keys(defMulti).length; i += 1) {
        if (defMulti[Object.keys(defMulti)[i]] > 1 && vulnRaw.indexOf(Object.keys(defMulti)[i]) === -1) {
          vulnTypes.push(`${Object.keys(defMulti)[i]} (x${defMulti[Object.keys(defMulti)[i]]})`);
          vulnRaw.push(Object.keys(defMulti)[i]);
        }
      }
      vulnDisplay[0] = `Vulnerable to: ${vulnTypes.join(', ')}`;
    }
    if (normalCheck) {
      for (var i = 0; i < Object.keys(defMulti).length; i += 1) {
        if (defMulti[Object.keys(defMulti)[i]] === 1 && normalRaw.indexOf(Object.keys(defMulti)[i]) === -1) {
          normalTypes.push(Object.keys(defMulti)[i]);
          normalRaw.push(Object.keys(defMulti)[i]);
        }
      }
      vulnDisplay[1] = `Takes normal damage from: ${normalTypes.join(', ')}`;
    }
    if (resistCheck) {
      for (var i = 0; i < Object.keys(defMulti).length; i += 1) {
        if (defMulti[Object.keys(defMulti)[i]] > 0 && defMulti[Object.keys(defMulti)[i]] < 1 && resistRaw.indexOf(Object.keys(defMulti)[i]) === -1) {
          resistTypes.push(`${Object.keys(defMulti)[i]} (x${defMulti[Object.keys(defMulti)[i]]})`);
          resistRaw.push(Object.keys(defMulti)[i]);
        }
      }
      vulnDisplay[2] = `Resists: ${resistTypes.join(', ')}`;
    }
    if (noCheck) {
      for (var i = 0; i < Object.keys(defMulti).length; i += 1) {
        if (defMulti[Object.keys(defMulti)[i]] === 0 && noRaw.indexOf(Object.keys(defMulti)[i]) === -1) {
          noTypes.push(Object.keys(defMulti)[i]);
          noRaw.push(Object.keys(defMulti)[i]);
        }
      }
      vulnDisplay[3] = `Not affected by: ${noTypes.join(', ')}`;
    }

    if (atkVulnCheck) {
      for (var i = 0; i < Object.keys(atkMulti).length; i += 1) {
        if (atkMulti[Object.keys(atkMulti)[i]] > 1 && atkVulnRaw.indexOf(Object.keys(atkMulti)[i]) === -1) {
          atkVulnTypes.push(`${Object.keys(atkMulti)[i]} (x${atkMulti[Object.keys(atkMulti)[i]]})`);
          atkVulnRaw.push(Object.keys(atkMulti)[i]);
        }
      }
      atkVulnDisplay[0] = `Supereffective against: ${atkVulnTypes.join(', ')}`;
    }
    if (atkNormalCheck) {
      for (var i = 0; i < Object.keys(atkMulti).length; i += 1) {
        if (atkMulti[Object.keys(atkMulti)[i]] === 1 && atkNormalRaw.indexOf(Object.keys(atkMulti)[i]) === -1) {
          atkNormalTypes.push(Object.keys(atkMulti)[i]);
          atkNormalRaw.push(Object.keys(atkMulti)[i]);
        }
      }
      atkVulnDisplay[1] = `Deals normal damage to: ${atkNormalTypes.join(', ')}`;
    }
    if (atkResistCheck) {
      for (var i = 0; i < Object.keys(atkMulti).length; i += 1) {
        if (atkMulti[Object.keys(atkMulti)[i]] > 0 && atkMulti[Object.keys(atkMulti)[i]] < 1 && atkResistRaw.indexOf(Object.keys(atkMulti)[i]) === -1) {
          atkResistTypes.push(`${Object.keys(atkMulti)[i]} (x${atkMulti[Object.keys(atkMulti)[i]]})`);
          atkResistRaw.push(Object.keys(atkMulti)[i]);
        }
      }
      atkVulnDisplay[2] = `Not very effective against: ${atkResistTypes.join(', ')}`;
    }
    if (atkNoCheck) {
      for (var i = 0; i < Object.keys(atkMulti).length; i += 1) {
        if (atkMulti[Object.keys(atkMulti)[i]] === 0 && atkNoRaw.indexOf(Object.keys(atkMulti)[i]) === -1) {
          atkNoTypes.push(Object.keys(atkMulti)[i]);
          atkNoRaw.push(Object.keys(atkMulti)[i]);
        }
      }
      atkVulnDisplay[3] = `Doesn't affect: ${atkNoTypes.join(', ')}`;
    }

    typeEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#A1E7B2')
      .setThumbnail('https://favna.xyz/images/ribbonhost/kalosdex.png')
      .setAuthor(`Type effectiveness for ${displayTypes.join(', ')}`)
      .addField('Offense', atkVulnDisplay.join('\n\n'))
      .addField('Defense', vulnDisplay.join('\n\n'))
      .addField('External Resources', oneLine `
		[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/${args.type.split(' ')[0]}_(type\\))  
		|  [Smogon](http://www.smogon.com/dex/sm/types/${args.type.split(' ')[0]})
		|  [PokémonDB](http://pokemondb.net/type/${args.type.split(' ')[0]})`);

    deleteCommandMessages(msg, this.client);

    return msg.embed(typeEmbed);
  }
};