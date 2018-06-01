/**
 * @file Extra xkcdCommand - Gets a random image from xkcd  
 * **Aliases**: `devjoke`, `comicjoke`
 * @module
 * @category extra
 * @name xkcd
 * @returns {MessageEmbed} Embedded image and info about it
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class xkcdCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'xkcd',
      memberName: 'xkcd',
      group: 'extra',
      aliases: ['devjoke', 'comicjoke'],
      description: 'Gets a random image from xkcd',
      examples: ['xkcd'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run (msg) {
    startTyping(msg);
    try {
      /* eslint-disable sort-vars */
      const totalImages = await request.get('https://xkcd.com/info.0.json'),
        randomNum = Math.floor(Math.random() * totalImages.body.num) + 1,
        randomImage = await request.get(`https://xkcd.com/${randomNum}/info.0.json`),
        xkcdEmbed = new MessageEmbed();
      /* eslint-enable sort-vars */

      xkcdEmbed
        .setTitle(randomImage.body.safe_title)
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setDescription(randomImage.body.alt)
        .setImage(randomImage.body.img)
        .setURL(`https://xkcd.com/${randomNum}/`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(xkcdEmbed);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('woops, couldn\'t get a random xkcd image. Have a 🎀 instead!');
    }
  }
};