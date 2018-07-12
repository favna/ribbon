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

  run (msg, {
    game,
    price = 'TBA'
  }) {
    try {
      startTyping(msg);

      /* eslint-disable sort-vars */
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
        results = fuse.search(game),
        hit = results[0];
      /* eslint-enable sort-vars*/

      if (hit.eshop_price) {
        if (hit.eshop_price === '0.00') {
          price = 'Free';
        } else {
          price = `$${hit.eshop_price} USD`;
        }
      }

      embed
        .setTitle(hit.title)
        .setURL(`https://www.nintendo.com/games/detail/${hit.slug}`)
        .setThumbnail(hit.front_box_art)
        .setColor('#FFA600')
        .addField('eShop Price', price, true)
        .addField('Release Date', moment(hit.release_date, 'MMM DD YYYY').format('MMMM Do YYYY'), true)
        .addField('Number of Players', hit.number_of_players, true)
        .addField('Game Code', hit.game_code, true)
        .addField('NSUID', hit.nsuid ? hit.nsuid : 'TBD', true)
        .addField('Categories', typeof hit.categories.category === 'object' ? hit.categories.category.join(', ') : hit.categories.category, true);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no titles found for \`${game}\``);
    }
  }
};