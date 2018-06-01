/**
 * @file Searches MangaCommand - Gets information about any manga from MyAnimeList  
 * **Aliases**: `cartoon`, `man`
 * @module
 * @category searches
 * @name manga
 * @example manga Yu-Gi-Oh
 * @param {StringResolvable} AnyManga manga to look up
 * @returns {MessageEmbed} Information about the requested manga
 */

const maljs = require('maljs'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class MangaCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'manga',
      memberName: 'manga',
      group: 'searches',
      aliases: ['cartoon', 'man'],
      description: 'Finds manga on MyAnimeList',
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
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {manga}) {
    try {
      startTyping(msg);
      const manEmbed = new MessageEmbed(),
        search = await maljs.quickSearch(manga, 'manga'),
        searchDetails = await search.manga[0].fetch();

      manEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(searchDetails.title)
        .setImage(searchDetails.cover)
        .setDescription(searchDetails.description)
        .setURL(`${searchDetails.mal.url}${searchDetails.path}`)
        .addField('Score', searchDetails.score, true)
        .addField('Popularity', searchDetails.popularity, true)
        .addField('Rank', searchDetails.ranked, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(manEmbed, `${searchDetails.mal.url}${searchDetails.path}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no manga found for \`${manga}\` `);
    }
  }
};