/**
 * @file Games DiceCommand - Rolls some dice with some sides. Great for the DnD players!  
 * **Aliases**: `xdicey`, `roll`, `dicey`, `die`
 * @module
 * @category games
 * @name dice
 * @example dice 5 6
 * @param {StringResolvable} DiceSides The amount of sides the dice should have
 * @param {StringResolvable} AmountOfRolls The amount of dice to roll
 * @returns {MessageEmbed} The eyes rolled for each dice as well as the total of all rolls
 */

import xdicey from 'xdicey';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class DiceCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dice',
      memberName: 'dice',
      group: 'games',
      aliases: ['xdicey', 'roll', 'dicey', 'die'],
      description: 'Rolls some dice with some sides. Great for the DnD players!',
      format: 'SidesOfTheDice AmountOfRolls',
      examples: ['dice 6 5'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'sides',
          prompt: 'How many sides does your die have?',
          type: 'integer',
          min: 4,
          max: 20
        }, {
          key: 'rolls',
          prompt: 'How many times should the die be rolled?',
          type: 'integer',
          min: 1,
          max: 40
        }
      ]
    });
  }

  run (msg, {sides, rolls}) {
    startTyping(msg);
    const diceEmbed = new MessageEmbed(),
      res = [],
      throwDice = xdicey(rolls, sides);

    for (const i in throwDice.individual) {
      res.push(`${throwDice.individual[i]}`);
    }

    diceEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setTitle('🎲 Dice Rolls 🎲')
      .setDescription(`| ${res.join(' | ')} |`)
      .addField('Total', throwDice.total, false);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(diceEmbed);
  }
};