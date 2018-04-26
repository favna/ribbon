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
 * @file Leaderboards OsuCommand - Shows Player Stats for a given OSU player  
 * **Aliases**: `osustats`
 * @module
 * @category leaderboards
 * @name osu
 * @example osu WubWoofWolf
 * @param {string} PlayerName Name of the OSU player
 * @returns {MessageEmbed} Stats of the player
 */

const _ = require('underscore'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, roundNumber, stopTyping, startTyping} = require('../../util.js');

module.exports = class OsuCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'osu',
      memberName: 'osu',
      group: 'leaderboards',
      aliases: ['osustats'],
      description: 'Shows Player Stats for a given OSU player',
      format: 'PlayerName',
      examples: ['osu WubWoofWolf'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'player',
          prompt: 'Respond with the OSU Player name',
          type: 'string',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  async run (msg, args) {
    try {
      startTyping(msg);
      const osuData = await request.get('https://osu.ppy.sh/api/get_user')
          .query('k', process.env.osukey)
          .query('u', args.player)
          .query('type', 'string')
          .set('Content-Type', 'application/json'),
        osuEmbed = new MessageEmbed();

      if (_.values(osuData.body[0]).includes(null)) {
        throw new Error();
      }

      osuEmbed
        .setTitle(`OSU! Player Stats for ${osuData.body[0].username} (${osuData.body[0].user_id})`)
        .setURL(`https://new.ppy.sh/u/${osuData.body[0].username}`)
        .setThumbnail('https://favna.xyz/images/ribbonhost/osulogo.png')
        .setImage(`http://lemmmy.pw/osusig/sig.php?colour=hex7CFC00&uname=${osuData.body[0].username}&flagshadow&darktriangles&avatarrounding=4&onlineindicator=undefined&xpbar&xpbarhex`)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .addField('Perfects', osuData.body[0].count300, true)
        .addField('Greats', osuData.body[0].count100, true)
        .addField('Poors', osuData.body[0].count50, true)
        .addField('Total Plays', osuData.body[0].playcount, true)
        .addField('Level', roundNumber(osuData.body[0].level), true)
        .addField('Accuracy', `${roundNumber(osuData.body[0].accuracy, 2)}%`, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(osuEmbed);
    } catch (err) {
      stopTyping(msg);

      return msg.reply(`no user found with username ${args.player}`);
    }
  }
};