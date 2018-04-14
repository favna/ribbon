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

/* eslint-disable no-unused-vars */

/**
 * @file Leaderboards RocketLeagueCommand - Shows Player Stats / Leaderboard from Rocket League    
 * **Aliases**: `rlstats`, `rocketstats`
 * @module
 * @category leaderboards
 * @name rocketleague
 * @example T.B.D
 * @param {string} T.B.D. Will be added later
 * @returns {MessageEmbed} T.B.D. - Will be added later
 */

const commando = require('discord.js-commando'),
  request = require('snekfetch'),
  {MessageEmbed} = require('discord.js');

module.exports = class RocketLeagueCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'rocketleague',
      'memberName': 'rocketleague',
      'group': 'leaderboards',
      'aliases': ['rlstats'],
      'description': 'Shows Player Stats / Leaderboard from Rocket League',
      'format': 'BattleTag',
      'examples': ['rocketleague'],
      'guildOnly': false,
      'ownerOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'player',
          'prompt': 'Respond with the player\'s BattleTag',
          'type': 'string',
          'parse': p => p.toLowerCase()
        }
      ]
    });
  }

  run (msg, args) {

    /**
     * @todo Implement Rocket League Leaderboard
     * @body Requires access to the Rocket League API which is pending.  
     * API is currently closed beta and requires granted access from Rocket League so hopefully I will be allowed access
     */

    return null;
  }
};