/**
 * @file Searches UrbanCommand - Define a word using UrbanDictionary  
 * **Aliases**: `ub`, `ud`
 * @module
 * @category searches
 * @name urban
 * @example urban Everclear
 * @param {StringResolvable} PhraseQuery Phrase that you want to define
 */

import { MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { stringify } from '../../components/querystring';
import { capitalizeFirstLetter, deleteCommandMessages, startTyping, stopTyping } from '../../components/util';

export default class UrbanCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'urban',
      aliases: [ 'ub', 'ud' ],
      group: 'searches',
      memberName: 'urban',
      description: 'Find definitions on urban dictionary',
      format: 'Term',
      examples: [ 'urban ugt' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'term',
          prompt: 'What term do you want to define?',
          type: 'string',
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, { term }: {term: string}) {
    try {
      startTyping(msg);
      const urbanSearch = await fetch(`https://api.urbandictionary.com/v0/define?${stringify({ term })}`);
      const definition = await urbanSearch.json();
      const urbanEmbed = new MessageEmbed();

      definition.list.sort((a: any, b: any) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

      urbanEmbed
        .setTitle(`Urban Search - ${definition.list[0].word}`)
        .setURL(definition.list[0].permalink)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(capitalizeFirstLetter(definition.list[0].definition.replace(/(?:\[|\])/gim, '')))
        .addField('Example', definition.list[0].example ? `${definition.list[0].example.slice(0, 1020)}${definition.list[0].example.length >= 1024 ? '...' : ''}` : 'None');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(urbanEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no definitions found for \`${term}\``);
    }
  }
}