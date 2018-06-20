/**
 * @file Searches GoogleCommand - Gets information through google  
 * Note: prioritizes Knowledge Graphs for better searching  
 * **Aliases**: `search`, `g`
 * @module
 * @category searches
 * @name google
 * @example google Pyrrha Nikos
 * @param {StringResolvable} SearchQuery Thing to find on google
 * @returns {Message} Result of your search
 */

const cheerio = require('cheerio'),
  request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class GoogleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'google',
      memberName: 'google',
      group: 'searches',
      aliases: ['search', 'g'],
      description: 'Finds anything on google',
      format: 'GoogleQuery',
      examples: ['google Pyrrha Nikos'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'query',
          prompt: 'What do you want to google?',
          type: 'string',
          parse: p => p.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '')
            .split(' ')
            .map(uriComponent => encodeURIComponent(uriComponent))
            .join('+')
        }
      ]
    });
  }

  async run (msg, {query}) {
    try {
      startTyping(msg);
      const knowledgeRes = await request.get('https://kgsearch.googleapis.com/v1/entities:search')
        .query('key', process.env.googleapikey)
        .query('limit', 1)
        .query('indent', true)
        .query('query', query);

      try {
        const knowledgeGraphEmbed = new MessageEmbed(),
          {result} = knowledgeRes.body.itemListElement[0];

        let types = result['@type'].map(t => t.replace(/([a-z])([A-Z])/g, '$1 $2')); // eslint-disable-line one-var

        if (types.length > 1) {
          types = types.filter(t => t !== 'Thing');
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
        const normalRes = await request.get('https://www.googleapis.com/customsearch/v1') // eslint-disable-line one-var
          .query('key', process.env.googleapikey)
          .query('cx', process.env.searchkey)
          .query('safe', msg.guild ? msg.channel.nsfw ? 'off' : 'medium' : 'high') // eslint-disable-line no-nested-ternary
          .query('q', query);

        if (normalRes && normalRes.body.queries.request[0].totalResults !== '0') {
          deleteCommandMessages(msg, this.client);
          stopTyping(msg);

          return msg.say(normalRes.body.items[0].link);
        }

        const noAPIRes = await request.get('https://www.google.com/search') // eslint-disable-line one-var
            .query('safe', msg.guild ? msg.channel.nsfw ? 'off' : 'medium' : 'high') // eslint-disable-line no-nested-ternary
            .query('q', query),
          $ = cheerio.load(noAPIRes.body.toString()), // eslint-disable-line sort-vars
          href = $('.r').first() // eslint-disable-line sort-vars
            .find('a')
            .first()
            .attr('href');

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.say(href.replace('/url?q=', '').split('&')[0]);
      }
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`error occurred or nothing found for \`${query}\``);
    }
  }
};