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
 * @file Games FightCommand - Pit two things against each other in a fight to the death. Winner is determined with random.org randomization.  
 * **Aliases**: `combat`
 * @module
 * @category games
 * @name fight
 * @example fight Pyrrha Ruby
 * @param {string} FighterOne The first combatant
 * @param {string} FighterTwo The second combatant
 * @returns {MessageEmbed} Result of the combat
 */

const random = require('node-random'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class FightCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'fight',
      memberName: 'fight',
      group: 'games',
      aliases: ['combat'],
      description: 'Pit two things against each other in a fight to the death',
      details: 'Winner is determined with random.org randomization',
      format: 'FirstFighter, SecondFighter',
      examples: ['fight Favna Chuck Norris'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'fighterOne',
          prompt: 'Who or what is the first fighter?',
          type: 'string'
        },
        {
          key: 'fighterTwo',
          prompt: 'What or what is the second fighter?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, args) {
    startTyping(msg);
    const fighterEmbed = new MessageEmbed();

    fighterEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setTitle('🥊 Fight Results 🥊')
      .setThumbnail('https://favna.xyz/images/ribbonhost/dbxlogo.png');

    if (args.fighterOne.toLowerCase() === 'chuck norris' || args.fighterTwo.toLowerCase() === 'chuck norris') {
      if (args.fighterOne.toLowerCase() === 'favna' || args.fighterTwo.toLowerCase() === 'favna') {
        fighterEmbed
          .addField('All right, you asked for it...', '***The universe was destroyed due to this battle between two unstoppable forces. Good Job.***')
          .setImage('https://favna.xyz/images/ribbonhost/universeblast.png');
      } else {
        fighterEmbed
          .addField('You fokn wot m8', '***Chuck Norris cannot be beaten***')
          .setImage('https://favna.xyz/images/ribbonhost/chucknorris.png');
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(fighterEmbed);
    }
    if (args.fighterOne.toLowerCase() === 'favna' || args.fighterTwo.toLowerCase() === 'favna') {
      fighterEmbed
        .addField('You got mega rekt', '***Favna always wins***')
        .setImage('https://favna.xyz/images/ribbonhost/pyrrhawins.gif');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(fighterEmbed);
    }
    random.integers({number: 2}, (error, data) => {
      if (!error) {
        const fighterOneChance = parseInt(data[0], 10),
          fighterTwoChance = parseInt(data[1], 10),
          loser = Math.min(fighterOneChance, fighterTwoChance) === fighterOneChance ? args.fighterOne : args.fighterTwo,
          winner = Math.max(fighterOneChance, fighterTwoChance) === fighterOneChance ? args.fighterOne : args.fighterTwo;

        fighterEmbed
          .addField('🇼 Winner', `**${winner}**`, true)
          .addField('🇱 Loser', `**${loser}**`, true)
          .setFooter(`${winner} bodied ${loser}`)
          .setTimestamp();

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(fighterEmbed);
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('an error occurred pitting these combatants against each other 😦');
    });
    stopTyping(msg);

    return null;
  }
};