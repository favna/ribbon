/**
 * @file Games DiceCommand - Rolls some dice with some sides. Great for the DnD players!
 *
 * **Aliases**: `xdicey`, `roll`, `dicey`, `die`
 * @module
 * @category games
 * @name dice
 * @example dice 5 6
 * @param {string} DiceSides The amount of sides the dice should have
 * @param {string} AmountOfRolls The amount of dice to roll
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';

type DiceArgs = {
  sides: number;
  rolls: number;
};

export default class DiceCommand extends Command {
  public constructor(client: CommandoClient) {
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

  public async run(msg: CommandoMessage, { sides, rolls }: DiceArgs) {
    const diceEmbed = new MessageEmbed();
    const res: string[] = [];
    const dice = this.rollDice(rolls, sides);

    dice.individual.forEach(die => {
      res.push(`${dice.individual[die]}`);
    });

    diceEmbed
      .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
      .setTitle('🎲 Dice Rolls 🎲')
      .setDescription(`| ${res.join(' | ')} |`)
      .addField('Total', dice.total, false);

    deleteCommandMessages(msg, this.client);

    return msg.embed(diceEmbed);
  }

  private rollDice(rolls: number, sides: number) {
    const result = [];

    for (let roll = 1; roll < Math.abs(rolls); roll++) {
      result[roll - 1] = Math.floor(Math.random() * Math.floor(Math.abs(sides))) + 1;
    }

    const totalAmount = result.reduce((total, current) => total + current, 0);

    return {
      individual: result,
      total: totalAmount,
    };
  }
}