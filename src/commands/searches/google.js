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
  fetch = require('node-fetch'),
  querystring = require('querystring'),
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

      const knowledgeSearch = await fetch(`https://kgsearch.googleapis.com/v1/entities:search?${querystring.stringify({
          key: process.env.googleapikey,
          limit: 1,
          indent: true,
          query
        })}`),
        knowledgeData = await knowledgeSearch.json(),
        {result} = knowledgeData.itemListElement[0],
        knowledgeGraphEmbed = new MessageEmbed();

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
      null;
    }

    try {
      const googleSearch = await fetch(`https://www.googleapis.com/customsearch/v1?${querystring.stringify({
          key: process.env.googleapikey,
          cx: process.env.searchkey,
          safe: msg.channel.nsfw ? 'off' : 'medium',
          q: query
        })}`),
        googleData = await googleSearch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.say(googleData.items[0].link);
    } catch (err) {
      null;
    }

    try {
      const backupSearch = await fetch(`https://www.google.com/search?${querystring.stringify({
          safe: msg.channel.nsfw ? 'off' : 'medium', 
          q: query
        })}`),
        $ = cheerio.load(await backupSearch.text()),
        href = $('.r').first()
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
};