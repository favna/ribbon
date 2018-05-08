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
 * @file Info EmotesCommand - Lists all emotes from the server  
 * **Aliases**: `listemo`, `emolist`, `listemoji`, `emote`
 * @module
 * @category info
 * @name emotes
 * @returns {MessageEmbed} List of emotes
 */

const {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class EmotesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'emotes',
      memberName: 'emotes',
      group: 'info',
      aliases: ['listemo', 'emolist', 'listemoji', 'emote'],
      description: 'Gets all available custom emotes from the server',
      examples: ['emotes'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg) {
    startTyping(msg);
    const embed = new MessageEmbed();

    let animEmotes = [],
      staticEmotes = [];

    msg.guild.emojis.forEach((e) => {
      e.animated ? animEmotes.push(`<a:${e.name}:${e.id}>`) : staticEmotes.push(`<:${e.name}:${e.id}>`);
    });

    embed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setAuthor(`${staticEmotes.length + animEmotes.length} ${msg.guild.name} Emotes`, msg.guild.iconURL({format: 'png'}))
      .setTimestamp();

    staticEmotes = staticEmotes.length !== 0 ? `__**${staticEmotes.length} Static Emotes**__\n${staticEmotes.join('')}` : '';
    animEmotes = animEmotes.length !== 0 ? `\n\n__**${animEmotes.length} Animated Emotes**__\n${animEmotes.join('')}` : '';

    embed.setDescription(staticEmotes + animEmotes);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(embed);
  }
};