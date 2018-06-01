/**
 * @file Searches AnimeCommand - Gets information about any anime from MyAnimeList  
 * **Aliases**: `ani`, `mal`
 * @module
 * @category searches
 * @name anime
 * @example anime Yu-Gi-Oh Dual Monsters
 * @param {StringResolvable} AnimeName anime to look up
 * @returns {MessageEmbed} Information about the requested anime
 */

const maljs = require('maljs'),
  {MessageEmbed} = require('discord.js'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class AnimeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'anime',
      memberName: 'anime',
      group: 'searches',
      aliases: ['ani', 'mal'],
      description: 'Finds anime on MyAnimeList',
      format: 'AnimeName',
      examples: ['anime Yu-Gi-Oh Dual Monsters'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'query',
          prompt: 'What anime do you want to find?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {anime}) {
    try {
      startTyping(msg);
      const aniEmbed = new MessageEmbed(),
        search = await maljs.quickSearch(anime, 'anime'),
        searchDetails = await search.anime[0].fetch();

      aniEmbed
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

      return msg.embed(aniEmbed, `${searchDetails.mal.url}${searchDetails.path}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no anime found for the input \`${anime}\` `);
    }
  }
};