/**
 * @file Searches MangaCommand - Gets information about any manga from kitsu.io  
 * **Aliases**: `cartoon`, `man`
 * @module
 * @category searches
 * @name manga
 * @example manga Yu-Gi-Oh
 * @param {StringResolvable} AnyManga manga to look up
 * @returns {MessageEmbed} Information about the fetched manga
 */

const fetch = require('node-fetch'),
  moment = require('moment'),
  momentduration = require('moment-duration-format'), // eslint-disable-line no-unused-vars
  {MessageEmbed} = require('discord.js'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, removeDiacritics, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class MangaCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'manga',
      memberName: 'manga',
      group: 'searches',
      aliases: ['cartoon', 'man'],
      description: 'Finds manga on kitsu.io',
      format: 'MangaName',
      examples: ['manga Pokemon'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'manga',
          prompt: 'What manga do you want to find?',
          type: 'string',
          parse: p => removeDiacritics(p.toLowerCase().replace(/([^a-zA-Z0-9_\- ])/gm, '')),
          default: 'pokemon'
        }
      ]
    });
  }

  async run (msg, {manga}) {
    try {
      startTyping(msg);
      const mangaList = await fetch(`https://${process.env.kitsuid}-dsn.algolia.net/1/indexes/production_media/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-Application-Id': process.env.kitsuid,
            'X-Algolia-API-Key': process.env.kitsukey

          },
          body: JSON.stringify({params: `query=${manga}&facetFilters=[\"kind:manga\"]`})
        }),
        mangas = await mangaList.json(),
        hit = mangas.hits[0],
        mangaEmbed = new MessageEmbed();

      mangaEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(hit.titles.en ? hit.titles.en : hit.canonicalTitle)
        .setURL(`https://kitsu.io/anime/${hit.id}`)
        .setDescription(hit.synopsis.replace(/(.+)(?:\r|\n|\t)(.+)/gim, '$1 $2').split('\r\n')[0])
        .setImage(hit.posterImage.original)
        .setThumbnail('https://favna.xyz/images/ribbonhost/kitsulogo.png')
        .addField('Canonical Title', hit.canonicalTitle, true)
        .addField('Score', `${hit.averageRating}%`, true)
        .addField('Age Rating', hit.ageRating, true)
        .addField('First Publish Date', moment.unix(hit.startDate).format('MMMM Do YYYY'), true)
        .addField('Genres', hit.categories.slice(0, 5).join(', '), false);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(mangaEmbed, `https://kitsu.io/manga/${hit.slug}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no manga found for \`${manga}\` `);
    }
  }
};