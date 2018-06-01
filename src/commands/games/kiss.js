/**
 * @file Games KissCommand - Give someone a kiss ❤!  
 * @module
 * @category games
 * @name kiss
 * @example kiss Pyrrha
 * @param {GuildMemberResolvable} [MemberToKiss] Name of the member you want to give a kiss
 * @returns {MessageEmbed} The kiss and a cute image ❤
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class KissCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'kiss',
      memberName: 'kiss',
      group: 'games',
      description: 'Give someone a kiss ❤',
      format: 'MemberToGiveAKiss',
      examples: ['kiss Favna'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to give a kiss?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  fetchImage () {
    const images = [
        'https://favna.xyz/images/ribbonhost/kiss/kiss01.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss02.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss03.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss04.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss05.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss06.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss07.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss08.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss09.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss10.gif',
        'https://favna.xyz/images/ribbonhost/kiss/kiss11.gif'
      ],
      curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

    return images[curImage];
  }

  run (msg, {member}) {
    startTyping(msg);
    deleteCommandMessages(msg, this.client);
    msg.embed({
      description: member !== ''
        ? `${member.displayName}! You were kissed by ${msg.member.displayName} 💋!`
        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
      image: {url: member !== '' ? this.fetchImage() : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
      color: msg.guild ? msg.guild.me.displayColor : 10610610
    });

    return stopTyping(msg);
  }
};