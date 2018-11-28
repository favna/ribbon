/**
 * @file Games EightBallCommand - Rolls a magic 8 ball using your input  
 * **Aliases**: `eightball`
 * @module
 * @category games
 * @name 8ball
 * @example 8ball is Favna a genius coder?
 * @param {StringResolvable} question Question you want the 8 ball to answer
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components/util';

export default class EightBallCommand extends Command {
  private predictions = [
    'It is certain',
    'It is decidedly so',
    'Without a doubt',
    'Yes definitely',
    'You may rely on it',
    'As I see it, yes',
    'Most likely',
    'Outlook good',
    'Yes',
    'Signs point to yes',
    'Reply hazy try again',
    'Ask again later',
    'Better not tell you now',
    'Cannot predict now',
    'Concentrate and ask again',
    'Don\'t count on it',
    'My reply is no',
    'My sources say no',
    'Outlook not so good',
    'Very doubtful'
  ];

  constructor (client: CommandoClient) {
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

  public run (msg: CommandoMessage, { question }: {question: string}) {
    startTyping(msg);
    const eightBallEmbed = new MessageEmbed();

    eightBallEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .addField(':question: Question', question, false)
      .addField(':8ball: 8ball', this.predictions[roundNumber(Math.random() * this.predictions.length)], false);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(eightBallEmbed);
  }
}