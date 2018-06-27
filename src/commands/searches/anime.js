/**
 * @file Searches AnimeCommand - Gets information about any anime from kitsu.io  
 * **Aliases**: `ani`, `mal`, `kitsu`
 * @module
 * @category searches
 * @name anime
 * @example anime Yu-Gi-Oh Dual Monsters
 * @param {StringResolvable} AnimeName anime to look up
 * @returns {MessageEmbed} Information about the requested anime
 */

const moment = require('moment'),
  momentduration = require('moment-duration-format'), // eslint-disable-line no-unused-vars
  request = require('snekfetch'),
  {MessageEmbed} = require('discord.js'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, removeDiacritics, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class AnimeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'anime',
      memberName: 'anime',
      group: 'searches',
      aliases: ['ani', 'mal', 'kitsu'],
      description: 'Finds anime on kitsu.io',
      format: 'AnimeName',
      examples: ['anime Yu-Gi-Oh Dual Monsters'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'anime',
          prompt: 'What anime do you want to find?',
          type: 'string',
          parse: p => removeDiacritics(p.toLowerCase().replace(/([^a-zA-Z0-9_\- ])/gm, ''))
        }
      ]
    });
  }

  async run (msg, {anime}) {
    try {
      startTyping(msg);
      const animeEmbed = new MessageEmbed(),
        animeList = await request.post(`https://${process.env.kitsuid}-dsn.algolia.net/1/indexes/production_media/query`)
          .set('Content-Type', 'application/json')
          .set('X-Algolia-Application-Id', process.env.kitsuid)
          .set('X-Algolia-API-Key', process.env.kitsukey)
          .send({params: `query=${anime}&facetFilters=[\"kind:anime\"]`}),
        hit = animeList.body.hits[0];

      animeEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(hit.titles.en ? hit.titles.en : hit.titles.en_jp)
        .setURL(`https://kitsu.io/anime/${hit.id}`)
        .setDescription(hit.synopsis.replace(/(.+)(?:\r|\n|\t)(.+)/gim, '$1 $2').split('\r\n')[0])
        .setImage(hit.posterImage.original)
        .setThumbnail('https://favna.xyz/images/ribbonhost/kitsulogo.png')
        .addField('Canonical Title', hit.canonicalTitle, true)
        .addField('Score', `${hit.averageRating}%`, true)
        .addField('Episode(s)', hit.episodeCount ? hit.episodeCount : 'Still airing', true)
        .addField('Episode Length', hit.episodeLength ? moment.duration(hit.episodeLength, 'minutes').format('h [hours] [and] m [minutes]') : 'unknown', true)
        .addField('Age Rating', hit.ageRating, true)
        .addField('First Air Date', moment.unix(hit.startDate).format('MMMM Do YYYY'), true)
        .addField('Genres', hit.categories.slice(0, 5).join(', '), false);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(animeEmbed, `https://kitsu.io/anime/${hit.slug}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no anime found for \`${anime}\` `);
    }
  }
};