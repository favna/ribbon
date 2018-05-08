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
 * @file Extra MathCommand - Take the effort out of calculations and let the bot do it for you  
 * **Aliases**: `maths`, `calc`
 * @module
 * @category extra
 * @name math
 * @example math (PI - 1) * 3
 * @param {string} Equation The equation to solve
 * @returns {MessageEmbed} Your equation and its answer
 */

const moment = require('moment'),
  scalc = require('scalc'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../util.js');

module.exports = class MathCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'math',
      memberName: 'math',
      group: 'extra',
      aliases: ['maths', 'calc'],
      description: 'Calculate anything',
      format: 'EquationToSolve',
      examples: ['math -10 - abs(-3) + 2^5'],
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
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  run (msg, {equation}) {
    startTyping(msg);
    const mathEmbed = new MessageEmbed();

    let res = '';

    try {
      res = scalc(equation);

      mathEmbed
        .setTitle('Calculator')
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(oneLine`The answer to \`${equation.toString()}\` is \`${res}\``);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(mathEmbed);
    } catch (err) {
      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`math\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** \`${equation}\`
      **Error Message:** ${err}
      `);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);
  
      return msg.reply(oneLine`\`${equation.toString()}\` is is not a valid equation for me.
          Check out this readme to see how to use the supported polish notation: https://github.com/dominhhai/calculator/blob/master/README.md`);
    }
  }
};