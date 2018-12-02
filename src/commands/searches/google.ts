/**
 * @file Searches GoogleCommand - Gets information through Google  
 * Note: prioritizes Knowledge Graphs for better searching  
 * **Aliases**: `search`, `g`
 * @module
 * @category searches
 * @name google
 * @example google Pyrrha Nikos
 * @param {StringResolvable} SearchQuery Thing to find on Google
 */

import * as cheerio from 'cheerio';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import fetch from 'node-fetch';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';
import { stringify } from '../../components/querystring';

export default class GoogleCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'google',
      aliases: [ 'search', 'g' ],
      group: 'searches',
      memberName: 'google',
      description: 'Finds anything on google',
      format: 'GoogleQuery',
      examples: [ 'google Pyrrha Nikos' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'query',
          prompt: 'What do you want to google?',
          type: 'string',
          parse: (p: string) => p.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '')
            .split(' ')
            .map(uriComponent => encodeURIComponent(uriComponent))
            .join('+'),
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, { query }: {query: string}) {
    const nsfwAllowed = msg.channel.type === 'text' ? (msg.channel as TextChannel).nsfw : true;
    try {
      startTyping(msg);

      const knowledgeSearch = await fetch(`https://kgsearch.googleapis.com/v1/entities:search?${stringify({
          query,
          indent: true,
          key: process.env.GOOGLE_API_KEY,
          limit: 1,
        })}`);
      const knowledgeData = await knowledgeSearch.json();
      const { result } = knowledgeData.itemListElement[0];
      const knowledgeGraphEmbed = new MessageEmbed();

      let types = result['@type'].map((t: string) => t.replace(/([a-z])([A-Z])/g, '$1 $2'));

      if (types.length > 1) {
        types = types.filter((t: string) => t !== 'Thing');
      }

      knowledgeGraphEmbed
        .setURL(result.detailedDescription.url)
        .setTitle(`${result.name} ${types.length === 0 ? '' : `(${types.join(', ')})`}`)
        .setImage(result.image.contentUrl)
        .setDescription(`${result.detailedDescription.articleBody} [Learn More...](${result.detailedDescription.url.replace(/\(/, '%28').replace(/\)/, '%29')})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(knowledgeGraphEmbed);
    } catch (err) {
      // Intentionally empty
    }

    try {
      const googleSearch = await fetch(`https://www.googleapis.com/customsearch/v1?${stringify({
          cx: process.env.SEARCH_KEY,
          key: process.env.GOOGLE_API_KEY,
          q: query,
          safe: nsfwAllowed ? 'off' : 'medium',
        })}`);
      const googleData = await googleSearch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.say(decodeURIComponent(googleData.items[0].link));
    } catch (err) {
      // Intentionally empty
    }

    try {
      const backupSearch = await fetch(`https://www.google.com/search?${stringify({
          q: query,
          safe: nsfwAllowed ? 'off' : 'medium',
        })}`);
      const $ = cheerio.load(await backupSearch.text());
      const href = $('.r').first()
          .find('a')
          .first()
          .attr('href');

      return msg.say(href.replace('/url?q=', '').split('&')[0]);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`error occurred or nothing found for \`${query}\``);
    }
  }
}