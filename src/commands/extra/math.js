/**
 * @file Extra MathCommand - Take the effort out of calculations and let the bot do it for you  
 * **Aliases**: `maths`, `calc`
 * @module
 * @category extra
 * @name math
 * @example math (pi - 1) * 3
 * @param {StringResolvable} Equation The equation to solve
 * @returns {MessageEmbed} Your equation and its answer
 */

const fetch = require('node-fetch'),
  moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class MathCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'math',
      memberName: 'math',
      group: 'extra',
      aliases: ['maths', 'calc'],
      description: 'Calculate anything',
      format: 'EquationToSolve',
      examples: ['math (PI - 1) * 3'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'equation',
          prompt: 'What is the equation to solve?',
          type: 'string',
          parse: p => p.toLowerCase().replace(/x/gim, '*')
        }
      ]
    });
  }

  async run (msg, {equation}) {
    try {
      startTyping(msg);
      const calculator = await fetch('http://api.mathjs.org/v4/', {
          method: 'POST',
          body: JSON.stringify({expr: equation})
        }),
        maths = await calculator.json(),
        mathEmbed = new MessageEmbed();

      if (maths.error) throw new Error('matherr');

      mathEmbed
        .setTitle('Calculator')
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(oneLine`The answer to \`${equation.toString()}\` is \`${maths.result}\``);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(mathEmbed);
    } catch (err) {
      stopTyping(msg);

      if ((/(?:matherr)/i).test(err.toString())) {
        return msg.reply(oneLine`\`${equation.toString()}\` is is not a supported equation. I use Math.js for my calculations (http://mathjs.org/)`);
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`math\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** \`${equation}\`
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};