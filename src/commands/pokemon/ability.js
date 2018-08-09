/**
 * @file Pokémon AbilityCommand - Gets information on an ability in Pokémon  
 * **Aliases**: `abilities`, `abi`
 * @module
 * @category pokémon
 * @name ability
 * @example ability multiscale
 * @param {StringResolvable} AbilityName The name of the ability you  want to find
 * @returns {MessageEmbed} Description and external links for the ability
 */

const Fuse = require('fuse.js'),
  moment = require('moment'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {BattleAbilities} = require(path.join(__dirname, '../../data/dex/abilities')),
  {AbilityAliases} = require(path.join(__dirname, '../../data/dex/aliases')),
  {oneLine, stripIndents} = require('common-tags'),
  {capitalizeFirstLetter, deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class AbilityCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ability',
      memberName: 'ability',
      group: 'pokemon',
      aliases: ['abilities', 'abi'],
      description: 'Get the info on a Pokémon ability',
      format: 'AbilityName',
      examples: ['ability Multiscale'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'ability',
          prompt: 'Get info on which ability?',
          type: 'string',
          parse: p => p.toLowerCase()
        }
      ]
    });
  }

  run (msg, {ability}) {
    try {
      startTyping(msg);
      const fsoptions = {
          shouldSort: true,
          threshold: 0.6,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['alias', 'ability', 'id', 'name']
        },
        aliasFuse = new Fuse(AbilityAliases, fsoptions),
        abilityFuse = new Fuse(BattleAbilities, fsoptions),
        aliasSearch = aliasFuse.search(ability),
        abilitySearch = aliasSearch.length ? abilityFuse.search(aliasSearch[0].ability) : abilityFuse.search(ability),
        abilityEmbed = new MessageEmbed();

      abilityEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setThumbnail('https://favna.xyz/images/ribbonhost/unovadexclosedv2.png')
        .addField('Description', abilitySearch[0].desc ? abilitySearch[0].desc : abilitySearch[0].shortDesc)
        .addField('External Resource', oneLine`
			[Bulbapedia](http://bulbapedia.bulbagarden.net/wiki/${capitalizeFirstLetter(abilitySearch[0].name.replace(/ /g, '_'))}_(Ability\\))  
			|  [Smogon](http://www.smogon.com/dex/sm/abilities/${abilitySearch[0].name.toLowerCase().replace(/ /g, '_')})  
			|  [PokémonDB](http://pokemondb.net/ability/${abilitySearch[0].name.toLowerCase().replace(/ /g, '-')})`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(abilityEmbed, `**${capitalizeFirstLetter(abilitySearch[0].name)}**`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      if ((/(?:Cannot read property 'desc' of undefined)/i).test(err.toString())) {
        return msg.reply(stripIndents`no ability found for \`${ability}\``);
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`ability\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Input:** ${ability}
      **Error Message:** ${err}
      `);
  
      return msg.reply(stripIndents`no ability found for \`${ability}\`. Be sure it is an ability that has an effect in battles!
      If it was an error that occurred then I notified ${this.client.owners[0].username} about it
      and you can find out more by joining the support server using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
};