/**
 * @file Searches ImageCommand - Gets an image through Google Images  
 * **Aliases**: `img`, `i`
 * @module
 * @category searches
 * @name image
 * @example image Pyrrha Nikos
 * @param {StringResolvable} ImageQuery Image to find on google images
 * @returns {MessageEmbed} Embedded image and search query
 */

const cheerio = require('cheerio'),
  fetch = require('node-fetch'),
  querystring = require('querystring'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class ImageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'image',
      memberName: 'image',
      group: 'searches',
      aliases: ['img', 'i'],
      description: 'Finds an image through google',
      format: 'ImageQuery',
      examples: ['image Pyrrha Nikos'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'query',
          prompt: 'What do you want to find images of?',
          type: 'string',
          parse: p => p.replace(/(who|what|when|where) ?(was|is|were|are) ?/gi, '')
            .split(' ')
            .map(x => encodeURIComponent(x))
            .join('+')
        }
      ]
    });
  }

  async run (msg, {query}) {
    const embed = new MessageEmbed();

    try {
      startTyping(msg);
      const imageSearch = await fetch(`https://www.googleapis.com/customsearch/v1?${querystring.stringify({
          cx: process.env.imagekey,
          key: process.env.googleapikey,
          safe: msg.channel.nsfw ? 'off' : 'medium',
          searchType: 'image',
          q: query
        })}`),
        imageData = await imageSearch.json();

      embed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setImage(imageData.items[0].link)
        .setFooter(`Search query: "${query.replace(/\+/g, ' ')}"`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);

    } catch (err) {
      null;
    }

    try {
      const backupSearch = await fetch(`https://www.google.com/search?${querystring.stringify({
          tbm: 'isch',
          gs_l: 'img', // eslint-disable-line camelcase
          safe: msg.channel.nsfw ? 'off' : 'medium',
          q: query
        })}`),
        $ = cheerio.load(await backupSearch.text()),
        src = $('.images_table').find('img').first().attr('src');

      embed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setImage(src)
        .setFooter(`Search query: "${query}"`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`nothing found for \`${msg.argString}\``);
    }
  }
};