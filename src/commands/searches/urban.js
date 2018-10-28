/**
 * @file Searches UrbanCommand - Define a word using UrbanDictionary  
 * **Aliases**: `ub`, `ud`
 * @module
 * @category searches
 * @name urban
 * @example urban Everclear
 * @param {StringResolvable} PhraseQuery Phrase that you want to define
 * @returns {MessageEmbed} Top definition for the fetched phrase
 */

import fetch from 'node-fetch';
import querystring from 'querystring';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class UrbanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'urban',
      memberName: 'urban',
      group: 'searches',
      aliases: ['ub', 'ud'],
      description: 'Find definitions on urban dictionary',
      format: 'Term',
      examples: ['urban ugt'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'term',
          prompt: 'What term do you want to define?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {term}) {
    try {
      startTyping(msg);
      const urbanSearch = await fetch(`https://api.urbandictionary.com/v0/define?${querystring.stringify({term})}`),
        definition = await urbanSearch.json(),
        urbanEmbed = new MessageEmbed();

      definition.list.sort((a, b) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

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
};