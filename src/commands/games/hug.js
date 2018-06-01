/**
 * @file Games HugCommand - Give someone a hug ❤!  
 * **Aliases**: `bearhug`, `embrace`
 * @module
 * @category games
 * @name hug
 * @example hug Pyrrha
 * @param {GuildMemberResolvable} [MemberToHug] Name of the member you want to give a hug
 * @returns {MessageEmbed} The hug and a cute image ❤
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class HugCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hug',
      memberName: 'hug',
      group: 'games',
      aliases: ['bearhug', 'embrace'],
      description: 'Give someone a hug ❤',
      format: 'MemberToGiveAHug',
      examples: ['hug Favna'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to give a hug?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  fetchImage () {
    const images = [
        'https://favna.xyz/images/ribbonhost/hug/hug01.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug02.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug03.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug04.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug05.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug06.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug07.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug08.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug09.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug10.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug11.gif',
        'https://favna.xyz/images/ribbonhost/hug/hug12.gif'
      ],
      curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

    return images[curImage];
  }

  run (msg, {member}) {
    startTyping(msg);
    deleteCommandMessages(msg, this.client);
    msg.embed({
      description: member !== ''
        ? `${member.displayName}! You were hugged by ${msg.member.displayName} 💖!`
        : `${msg.member.displayName} you must feel alone... Have a 🐈`,
      image: {url: member !== '' ? this.fetchImage() : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
      color: msg.guild ? msg.guild.me.displayColor : 10610610
    });

    return stopTyping(msg);
  }
};