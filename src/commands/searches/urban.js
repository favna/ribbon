/**
 * @file Searches UrbanCommand - Define a word using UrbanDictionary  
 * **Aliases**: `ub`, `ud`
 * @module
 * @category searches
 * @name urban
 * @example urban Everclear
 * @param {StringResolvable} PhraseQuery Phrase that you want to define
 * @returns {MessageEmbed} Top definition for the requested phrase
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class UrbanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'urban',
      memberName: 'urban',
      group: 'searches',
      aliases: ['ub', 'ud'],
      description: 'Find definitions on urban dictionary',
      format: 'Term',
      examples: ['urban ugt'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'term',
          prompt: 'What term do you want to define?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {term}) {
    startTyping(msg);
    const urban = await request.get('https://api.urbandictionary.com/v0/define').query('term', term);

    if (urban.ok && urban.body.result_type !== 'no_results') {
      const embed = new MessageEmbed();

      urban.body.list.sort((a, b) => b.thumbs_up - b.thumbs_down - (a.thumbs_up - a.thumbs_down));

      embed
        .setTitle(`Urban Search - ${urban.body.list[0].word}`)
        .setURL(urban.body.list[0].permalink)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(urban.body.list[0].definition)
        .addField('Example',
          urban.body.list[0].example.length <= 1024
            ? urban.body.list[0].example
            : `Truncated due to exceeding maximum length\n${urban.body.list[0].example.slice(0, 970)}`,
          false);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);
    }
    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.reply(`no definitions found for \`${term}\``);
  }
};