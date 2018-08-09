/**
 * @file Weeb HugCommand - Give someone a hug ❤!  
 * @module
 * @category weeb
 * @name hug
 * @example hug Nora
 * @param {GuildMemberResolvable} [MemberToHug] Name of the member you want to give a hug
 * @returns {MessageEmbed} The hug and a cute image ❤
 */

const fetch = require('node-fetch'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class HugCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hug',
      memberName: 'hug',
      group: 'weeb',
      description: 'Give someone a hug ❤',
      format: 'MemberToGiveAHug',
      examples: ['hug Nora'],
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

  async run (msg, {member}) {
    try {
      startTyping(msg);

      const hugFetch = await fetch('https://nekos.life/api/v2/img/hug'),
        hugImg = await hugFetch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member
          ? `${member.displayName}! You were hugged by ${msg.member.displayName} 💖!`
          : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member ? hugImg.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a hug image 💔');
    }
  }
};