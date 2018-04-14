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
 * @file Leaderboards OsuCommand - Shows Player Stats for a given OSU player  
 * **Aliases**: `osustats`
 * @module
 * @category leaderboards
 * @name osu
 * @example osu WubWoofWolf
 * @param {string} PlayerName Name of the OSU player
 * @returns {MessageEmbed} Stats of the player
 */

const commando = require('discord.js-commando'),
  request = require('snekfetch'),
  {MessageEmbed} = require('discord.js');

module.exports = class OsuCommand extends commando.Command {
  constructor (client) {
    super(client, {
      'name': 'osu',
      'memberName': 'osu',
      'group': 'leaderboards',
      'aliases': ['osustats'],
      'description': 'Shows Player Stats for a given OSU player',
      'format': 'PlayerName',
      'examples': ['osu WubWoofWolf'],
      'guildOnly': false,
      'ownerOnly': true,
      'throttling': {
        'usages': 2,
        'duration': 3
      },
      'args': [
        {
          'key': 'player',
          'prompt': 'Respond with the OSU Player name',
          'type': 'string',
          'parse': p => p.toLowerCase()
        }
      ]
    });
  }

  run (msg, args) {

    /**
     * @todo Implement Osu Player Stats
     * @body Will use official API endpoints: https://github.com/ppy/osu-api/wiki
     */

    return null;
  }
};