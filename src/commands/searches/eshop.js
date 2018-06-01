/**
 * @file Searches EShopCommand - Gets information about a game in the Nintendo Switch eShop  
 * **Aliases**: `shop`
 * @module
 * @category searches
 * @name eshop
 * @example eshop Breath of The Wild
 * @param {StringResolvable} GameName Game that you want to find in the eShop
 * @returns {MessageEmbed} Information about the requested game
 */

const Fuse = require('fuse.js'),
  fs = require('fs'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class EShopCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'eshop',
      memberName: 'eshop',
      group: 'searches',
      aliases: ['shop'],
      description: 'Gets any game from the Nintendo eShop',
      format: 'GameName',
      examples: ['eshop Breath of the Wild'],
      guildOnly: false,
      args: [
        {
          key: 'game',
          prompt: 'What game to find?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, {game}) {
    startTyping(msg);
    if (fs.existsSync(path.join(__dirname, '../../data/databases/eshop.json'))) {

      /* eslint-disable sort-vars, no-var, vars-on-top, one-var*/
      const embed = new MessageEmbed(),
        fsoptions = {
          shouldSort: true,
          threshold: 0.6,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['title']
        },
        games = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/databases/eshop.json'), 'utf8')),
        fuse = new Fuse(games, fsoptions),
        results = fuse.search(game);
      /* eslint-enable sort-vars*/

      if (results.length) {
        embed
          .setTitle(results[0].title)
          .setURL(`https://www.nintendo.com/games/detail/${results[0].slug}`)
          .setThumbnail(results[0].front_box_art)
          .setColor('#FFA600')
          .addField('eShop Price', results[0].eshop_price ? `$${results[0].eshop_price} USD` : 'TBA', true)
          .addField('Release Date', moment(results[0].release_date, 'MMM DD YYYY').format('MMMM Do YYYY'), true)
          .addField('Number of Players', results[0].number_of_players, true)
          .addField('Game Code', results[0].game_code, true)
          .addField('NSUID', results[0].nsuid ? results[0].nsuid : 'TBD', true)
          .addField('Categories', typeof results[0].categories.category === 'object' ? results[0].categories.category.join(', ') : results[0].categories.category, true);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(embed);
      }

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`No titles found for \`${game}\``);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(oneLine`eshop data was not found!!
		Ask <@${this.client.owners[0].id}> to generate it`);
  }
};