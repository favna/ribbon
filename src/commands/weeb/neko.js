/**
 * @file Weeb NekoCommand - Get a random cute cat girl 😍!  
 * **Aliases**: `catgirl`
 * @module
 * @category weeb
 * @name neko
 * @example neko
 * @returns {MessageEmbed} The neko and an image
 */

const fetch = require('node-fetch'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class nekoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'neko',
      memberName: 'neko',
      group: 'weeb',
      aliases: ['catgirl'],
      description: 'Get a random cute cat girl 😍',
      examples: ['neko'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run (msg) {
    try {
      startTyping(msg);

      const nekoFetch = await fetch('https://nekos.life/api/v2/img/neko'),
        nekoImg = await nekoFetch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: `Here is your cute cat girl ${msg.member.displayName} 😻!`,
        image: {url: nekoImg.url},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<:cat:498198858032218143> <@${msg.author.id}> <:cat:498198858032218143>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a neko image 💔');
    }
  }
};