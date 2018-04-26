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
 * @file Games EightBallCommand - Rolls a magic 8 ball using your input  
 * **Aliases**: `eightball`
 * @module
 * @category games
 * @name 8ball
 * @example 8ball is Favna a genius coder?
 * @param {string} question Question you want the 8 ball to answer
 * @returns {MessageEmbed} Your question and its answer
 */

const predict = require('eightball'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class EightBallCommand extends Command {
  constructor (client) {
    super(client, {
      name: '8ball',
      memberName: '8ball',
      group: 'games',
      aliases: ['eightball'],
      description: 'Roll a magic 8ball',
      format: 'YourQuestion',
      examples: ['8ball is Favna a genius coder?'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'question',
          prompt: 'For what question should I roll a magic 8ball?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, args) {
    startTyping(msg);
    const eightBallEmbed = new MessageEmbed();

    eightBallEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .addField(':question: Question', args.question, false)
      .addField(':8ball: 8ball', predict(), false);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(eightBallEmbed);
  }
};