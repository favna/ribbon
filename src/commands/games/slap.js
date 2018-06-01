/**
 * @file Games SlapCommand - Slap a dumb person💢!  
 * **Aliases**: `bakaslap`
 * @module
 * @category games
 * @name slap
 * @example slap Cinder
 * @param {GuildMemberResolvable} [MemberToSlap] Name of the member you want to slap
 * @returns {MessageEmbed} The slap and an image
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class SlapCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'slap',
      memberName: 'slap',
      group: 'games',
      aliases: ['bakaslap'],
      description: 'Give someone a slap 💢',
      format: 'MemberToGiveASlap',
      examples: ['slap Favna'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to give a slap?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  fetchImage () {
    const images = [
        'https://favna.xyz/images/ribbonhost/slap/slap01.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap02.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap03.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap04.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap05.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap06.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap07.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap08.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap09.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap10.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap11.gif',
        'https://favna.xyz/images/ribbonhost/slap/slap12.gif'
      ],
      curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

    return images[curImage];
  }

  run (msg, {member}) {
    startTyping(msg);
    deleteCommandMessages(msg, this.client);
    msg.embed({
      description: member !== ''
        ? `${member.displayName}! You got slapped by ${msg.member.displayName} 💢!`
        : `${msg.member.displayName} did you mean to slap someone B-Baka 🤔?`,
      image: {url: member !== '' ? this.fetchImage() : 'http://cdn.awwni.me/mz98.gif'},
      color: msg.guild ? msg.guild.me.displayColor : 10610610
    });

    return stopTyping(msg);
  }
};