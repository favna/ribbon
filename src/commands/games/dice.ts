/**
 * @file Games DiceCommand - Rolls some dice with some sides. Great for the DnD players!  
 * **Aliases**: `xdicey`, `roll`, `dicey`, `die`
 * @module
 * @category games
 * @name dice
 * @example dice 5 6
 * @param {StringResolvable} DiceSides The amount of sides the dice should have
 * @param {StringResolvable} AmountOfRolls The amount of dice to roll
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class DiceCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'dice',
      aliases: [ 'xdicey', 'roll', 'dicey', 'die' ],
      group: 'games',
      memberName: 'dice',
      description: 'Rolls some dice with some sides. Great for the DnD players!',
      format: 'SidesOfTheDice AmountOfRolls',
      examples: [ 'dice 6 5' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'sides',
          prompt: 'How many sides does your die have?',
          type: 'integer',
          max: 20,
          min: 4,
        },
        {
          key: 'rolls',
          prompt: 'How many times should the die be rolled?',
          type: 'integer',
          max: 40,
          min: 1,
        }
      ],
    });
  }

  public run (msg: CommandoMessage, { sides, rolls }: {sides: number, rolls: number}) {
    startTyping(msg);
    const diceEmbed = new MessageEmbed();
    const res = [];
    const throwDice = this.xdicey(rolls, sides);

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

  private xdicey (rolls: number, sides: number) {
    const result = [];

    for (let i = 1; i < Math.abs(rolls); i++) {
      result[i - 1] = Math.floor(Math.random() * Math.floor(Math.abs(sides))) + 1;
    }

    const totalAmount = result.reduce((total, current) => total + current, 0);

    return {
      individual: result,
      total: totalAmount,
    };
  }
}