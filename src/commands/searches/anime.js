/**
 * @file Searches AnimeCommand - Gets information about any anime from kitsu.io  
 * **Aliases**: `ani`, `mal`, `kitsu`
 * @module
 * @category searches
 * @name anime
 * @example anime Yu-Gi-Oh Dual Monsters
 * @param {StringResolvable} AnimeName anime to look up
 * @returns {MessageEmbed} Information about the fetched anime
 */

import fetch from 'node-fetch';
import moment from 'moment';
import momentduration from 'moment-duration-format'; // eslint-disable-line no-unused-vars
import {MessageEmbed} from 'discord.js';
import {Command} from 'discord.js-commando';
import {deleteCommandMessages, removeDiacritics, stopTyping, startTyping} from '../../components/util.js';

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
      const animeList = await fetch(`https://${process.env.kitsuid}-dsn.algolia.net/1/indexes/production_media/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Algolia-Application-Id': process.env.kitsuid,
            'X-Algolia-API-Key': process.env.kitsukey

          },
          body: JSON.stringify({params: `query=${anime}&facetFilters=[\"kind:anime\"]`})
        }),
        animes = await animeList.json(),
        hit = animes.hits[0],
        animeEmbed = new MessageEmbed();

      animeEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(hit.titles.en ? hit.titles.en : hit.canonicalTitle)
        .setURL(`https://kitsu.io/anime/${hit.id}`)
        .setDescription(hit.synopsis.replace(/(.+)(?:\r|\n|\t)(.+)/gim, '$1 $2').split('\r\n')[0])
        .setImage(hit.posterImage.original)
        .setThumbnail('https://favna.xyz/images/ribbonhost/kitsulogo.png')
        .addField('Canonical Title', hit.canonicalTitle, true)
        .addField('Score', `${hit.averageRating}%`, true)
        .addField('Episode(s)', hit.episodeCount ? hit.episodeCount : 'Still airing', true)
        .addField('Episode Length', hit.episodeLength ? moment.duration(hit.episodeLength, 'minutes').format('h [hours] [and] m [minutes]') : 'unknown', true)
        .addField('Age Rating', hit.ageRating, true)
        .addField('First Air Date', moment.unix(hit.startDate).format('MMMM Do YYYY'), true);

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