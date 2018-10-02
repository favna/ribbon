/**
 * @file Games CookieCommand - Steal someone's 🍪 gnanahahahaha  
 * **Aliases**: `.biscuit`, `biscuit`
 * @module
 * @category games
 * @name biscuit
 * @returns {MessageEmbed} A MessageEmbed with a cookie gif
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class CookieCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'cookie',
      memberName: 'cookie',
      group: 'games',
      aliases: ['biscuit'],
      description: 'Steal someone\'s 🍪 gnanahahahaha',
      guildOnly: false,
      patterns: [/^\.(?:biscuit)$/i],
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Whose cookie to steal?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  fetchImage () {
    const images = [
        'https://favna.xyz/images/ribbonhost/cookie/cookie01.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie02.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie03.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie04.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie05.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie06.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie07.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie08.gif',
        'https://favna.xyz/images/ribbonhost/cookie/cookie09.gif'
      ],
      curImage = Math.floor(Math.random() * images.length);

    return images[curImage];
  }

  verifyRmt (msg) {
    if (msg.guild.id === '373826006651240450') return true;
    if (msg.guild.commandPrefix === '.') return true;
    if (msg.guild.settings.get('regexmatches', false)) return true;
    if (this.client.isOwner(msg.author)) return true;

    return false;
  }

  run (msg, {member}) {
    if (msg.patternMatches && !this.verifyRmt(msg)) return null;

    startTyping(msg);
    const cookieEmbed = new MessageEmbed();

    cookieEmbed.setImage(this.fetchImage())
      .setColor(msg.guild ? msg.guild.me.displayColor : '#7CFC00');
    member ? cookieEmbed.setDescription(`Gnanahahahaha eating your cookie <@${member.id}>`) : cookieEmbed.setDescription('You won\'t steal my cookie!!');

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(cookieEmbed);
  }
};