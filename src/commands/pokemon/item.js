/**
 * @file Pokémon ItemCommand - Gets information about an item in Pokémon
 * For item names existing of multiple words (for example `life orb`) you can either type it with or without the space  
 * **Aliases**: `it`, `bag`
 * @module
 * @category pokemon
 * @name item
 * @example item assault vest
 * @param {StringResolvable} ItemName Name of the item to find
 * @returns {MessageEmbed} Description and external links for the item
 */

const Fuse = require('fuse.js'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {BattleItems} = require(path.join(__dirname, '../../data/dex/items')),
  {ItemAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {oneLine, stripIndents} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class ItemCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'item',
      memberName: 'item',
      group: 'pokemon',
      aliases: ['it', 'bag'],
      description: 'Get the info on an item in Pokémon',
      format: 'ItemName',
      examples: ['item Life Orb'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'item',
          prompt: 'Get info on which item?',
          type: 'string',
          parse: p => p.toLowerCase().replace(/ /g, '')
        }
      ]
    });
  }

  run (msg, {item}) {
    try {
      startTyping(msg);
      const fsoptions = {
          shouldSort: true,
          threshold: 0.3,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['alias', 'item', 'id', 'name']
        },
        aliasFuse = new Fuse(ItemAliases, fsoptions),
        itemFuse = new Fuse(BattleItems, fsoptions),
        aliasSearch = aliasFuse.search(item),
        itemSearch = aliasSearch.length ? itemFuse.search(aliasSearch[0].item) : itemFuse.search(item),
        itemEmbed = new MessageEmbed();

      itemEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosedv2.png')
        .setAuthor(`${capitalizeFirstLetter(itemSearch[0].name)}`, `https://play.pokemonshowdown.com/sprites/itemicons/${itemSearch[0].name.toLowerCase().replace(/ /g, '-')}.png`)
        .addField('Description', itemSearch[0].desc)
        .addField('Generation Introduced', itemSearch[0].gen)
        .addField('External Resources', oneLine`
			[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(itemSearch[0].name.replace(' ', '_').replace('\'', ''))})  
			|  [Smogon](http://www.smogon.com/dex/sm/items/${itemSearch[0].name.toLowerCase().replace(' ', '_')
    .replace('\'', '')})  
			|  [PokémonDB](http://pokemondb.net/item/${itemSearch[0].name.toLowerCase().replace(' ', '-')
    .replace('\'', '')})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(itemEmbed, `**${capitalizeFirstLetter(itemSearch[0].name)}**`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      if ((/(?:Cannot read property 'name' of undefined)/i).test(err.toString())) {
        return msg.reply(stripIndents`no item found for \`${item}\``);
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`item\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** ${item}
      **Error Message:** ${err}
      `);

      return msg.reply(stripIndents`no item found for \`${item}\`. Be sure it is an item that has an effect in battles!
      If it was an error that occurred then I notified ${this.client.owners[0].username} about it
      and you can find out more by joining the support server using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
};