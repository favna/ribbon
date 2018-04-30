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
 * @file Games RockPaperScissorCommand - Play Rock Paper Scissors against random.org randomization  
 * **Aliases**: rockpaperscissors
 * @module
 * @category games
 * @name rps
 * @example rps Rock
 * @param {string} HandToPlay The hand that you want to play
 * @returns {MessageEmbed} Result of the conflict
 */

const random = require('node-random'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class RockPaperScissorCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rps',
      memberName: 'rps',
      group: 'games',
      aliases: ['rockpaperscissors'],
      description: 'Play Rock Paper Scissors against random.org randomization',
      format: 'HandToPlay',
      examples: ['rps Rock'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'hand',
          prompt: 'Do you play rock, paper or scissors?',
          type: 'string',
          validate: (hand) => {
            const validHands = ['rock', 'paper', 'scissors'];

            if (validHands.includes(hand.toLowerCase())) {
              return true;
            }

            return `Has to be one of ${validHands.join(', ')}`;
          },
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  run (msg, args) {
    startTyping(msg);
    random.integers({
      number: 1,
      minimum: 1,
      maximum: 3
    }, (error, randoms) => { // eslint-disable-line complexity
      if (!error) {
        const rpsEmbed = new MessageEmbed();

        let resString = 'Woops something went wrong';

        if (args.hand === 'rock' && randoms === 1) {
          resString = 'It\'s a draw 😶! Both picked 🗿';
        } else if (args.hand === 'rock' && randoms === 2) {
          resString = 'I won 😃! My 📜 covered your 🗿';
        } else if (args.hand === 'rock' && randoms === 3) {
          resString = ' I lost 😞! Your 🗿 smashed my ️️️✂️ to pieces';
        } else if (args.hand === 'paper' && randoms === 1) {
          resString = 'I lost 😞! Your 📜 covered my 🗿';
        } else if (args.hand === 'paper' && randoms === 2) {
          resString = 'It\'s a draw 😶! Both picked 📜';
        } else if (args.hand === 'paper' && randoms === 3) {
          resString = 'I won 😃! My ✂️ cut your 📜 to shreds';
        } else if (args.hand === 'scissor' && randoms === 1) {
          resString = 'I won 😃! My 🗿 smashed your ✂️ to pieces';
        } else if (args.hand === 'scissor' && randoms === 2) {
          resString = 'I lost 😞! Your ✂️ cut my 📜 to shreds';
        } else if (args.hand === 'scissor' && randoms === 3) {
          resString = 'It\'s a draw 😶! Both picked ✂️';
        }

        rpsEmbed
          .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
          .setTitle('Rock Paper Scissors')
          .setDescription(resString);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(rpsEmbed);
      }
      stopTyping(msg);

      return msg.reply('an error occurred getting a random result and I\'m not going to rig this game.');
    });
  }
};