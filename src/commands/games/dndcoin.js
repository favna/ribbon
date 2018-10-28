/**
 * @file Games DndCCommand - Flips a coin  
 * **Aliases**: `coinflip`, `dndc`, `dcoin`
 * @module
 * @category games
 * @name dndc
 * @returns {MessageEmbed} Side the coin landed on
 */

import {Command} from 'discord.js-commando'; 
import {MessageEmbed} from 'discord.js'; 
import {deleteCommandMessages, roundNumber, stopTyping, startTyping} from '../../components/util.js';

module.exports = class DndCCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'dndcoin',
      memberName: 'dndcoin',
      group: 'games',
      aliases: ['coinflip', 'dndc', 'dcoin'],
      description: 'Flips a coin',
      examples: ['coin'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run (msg) {
    startTyping(msg);
    const coinEmbed = new MessageEmbed(),
      flip = roundNumber(Math.random());

    coinEmbed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setImage(flip === 1 ? 'https://favna.xyz/images/ribbonhost/dndheads.png' : 'https://favna.xyz/images/ribbonhost/dndtails.png')
      .setTitle(`Flipped ${flip === 1 ? 'heads' : 'tails'}`);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(coinEmbed);
  }
};