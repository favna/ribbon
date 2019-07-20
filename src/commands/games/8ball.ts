/**
 * @file Games EightBallCommand - Rolls a magic 8 ball using your input
 *
 * **Aliases**: `eightball`
 * @module
 * @category games
 * @name 8ball
 * @example 8ball is Favna a genius coder?
 * @param {string} question Question you want the 8 ball to answer
 */

import { DEFAULT_EMBED_COLOR, eightBallPredictionsMap } from '@components/Constants';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';

type EightBallArgs = {
  question: string;
};

export default class EightBallCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: '8ball',
      aliases: [ 'eightball' ],
      group: 'games',
      memberName: '8ball',
      description: 'Roll a magic 8ball',
      format: 'YourQuestion',
      examples: [ '8ball is Favna a genius coder?' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'question',
          prompt: 'For what question should I roll a magic 8ball?',
          type: 'string',
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { question }: EightBallArgs) {
    const eightBallEmbed = new MessageEmbed();

    eightBallEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : DEFAULT_EMBED_COLOR)
      .addField(':question: Question', question, false)
      .addField(':8ball: 8ball',
        eightBallPredictionsMap[roundNumber(Math.random() * eightBallPredictionsMap.length)],
        false);

    deleteCommandMessages(msg, this.client);

    return msg.embed(eightBallEmbed);
  }
}