/**
 * @file Extra Zalgo - Create zalgo-fied text from your input  
 * First banishes any existing zalgo to ensure proper result  
 * **Aliases**: `trash`
 * @module
 * @category extra
 * @name zalgo
 * @example zalgo HE COMES 
 * @param {StringResolvable} SomeText Your input to transform with Zalgo
 * @returns {Message} Your text zalgo-fied
 */

import banish from 'to-zalgo/banish';
import zalgo from 'to-zalgo';
import {Command} from 'discord.js-commando';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class zalgoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'zalgo',
      memberName: 'zalgo',
      group: 'extra',
      aliases: ['trash'],
      description: 'F*ck up text using Zalgo',
      format: 'ContentToTransform',
      examples: ['zalgo HE COMES'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'txt',
          prompt: 'What should I zalgolize?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, {txt}) {
    startTyping(msg);
    deleteCommandMessages(msg, this.client);

    msg.say(zalgo(banish(txt)));

    return stopTyping(msg);
  }
};