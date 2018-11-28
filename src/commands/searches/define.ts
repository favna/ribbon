/**
 * @file Searches DefineCommand - Define a word using glosbe  
 * **Aliases**: `def`, `dict`
 * @module
 * @category searches
 * @name define
 * @example define Google
 * @param {StringResolvable} Word the word you want to define
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { stringify } from '../../components/querystring';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class DefineCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'define',
      aliases: [ 'def', 'dict' ],
      group: 'searches',
      memberName: 'define',
      description: 'Gets the definition on a word on glosbe',
      format: 'Word',
      examples: [ 'define pixel' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'query',
          prompt: 'What word do you want to define?',
          type: 'string',
          parse: (p: string) => p.replace(/[^a-zA-Z]/g, ''),
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, { query }: {query: string}) {
    try {
      startTyping(msg);
      const defineEmbed = new MessageEmbed();
      const res = await fetch(`https://glosbe.com/gapi/translate?${stringify({
          dest: 'en',
          format: 'json',
          from: 'en',
          phrase: query,
        })}`);
      const words = await res.json();
      const final = [ `**Definitions for __${query}__:**` ];

      for (let [index, item] of Object.entries(words.tuc.filter((tuc: any) => tuc.meanings)[0].meanings.slice(0, 5))) {

        // @ts-ignore
        item = item.text
          .replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '_')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, '\'')
          .replace(/<b>/g, '[')
          .replace(/<\/b>/g, ']')
          .replace(/<i>|<\/i>/g, '_');
        final.push(`**${Number(index) + 1}:** ${item}`);
      }
      defineEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(final);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(defineEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`nothing found for \`${query}\`, maybe check your spelling?`);
    }
  }
}