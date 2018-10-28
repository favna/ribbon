/**
 * @file Weeb KissCommand - Give someone a kiss ❤!  
 * @module
 * @category weeb
 * @name kiss
 * @example kiss Pyrrha
 * @param {GuildMemberResolvable} [MemberToKiss] Name of the member you want to give a kiss
 * @returns {MessageEmbed} The kiss and a cute image ❤
 */

import fetch from 'node-fetch';
import {Command} from 'discord.js-commando';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class KissCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'kiss',
      memberName: 'kiss',
      group: 'weeb',
      description: 'Give someone a kiss ❤',
      format: 'MemberToGiveAKiss',
      examples: ['kiss Pyrrha'],
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

  async run (msg, {member}) {
    try {
      startTyping(msg);

      const kissFetch = await fetch('https://nekos.life/api/v2/img/kiss'),
        kissImg = await kissFetch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member
          ? `${member.displayName}! You were kissed by ${msg.member.displayName} 💋!` : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member ? kissImg.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a kiss image 💔');
    }
  }

};