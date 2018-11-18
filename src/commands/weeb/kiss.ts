/**
 * @file Weeb KissCommand - Give someone a kiss ❤!  
 * @module
 * @category weeb
 * @name kiss
 * @example kiss Pyrrha
 * @param {GuildMemberResolvable} [MemberToKiss] Name of the member you want to give a kiss
 * @returns {MessageEmbed} The kiss and a cute image ❤
 */

import { GuildMember } from 'discord.js';
import {Command, CommandoClient, CommandoMessage} from 'discord.js-commando';
import fetch from 'node-fetch';
import {deleteCommandMessages, startTyping, stopTyping} from '../../components/util';

export default class KissCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'kiss',
      group: 'weeb',
      memberName: 'kiss',
      description: 'Give someone a kiss ❤',
      format: 'MemberToGiveAKiss',
      examples: ['kiss Pyrrha'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to give a kiss?',
          type: 'member',
          default: '',
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, {member}: {member: GuildMember}) {
    try {
      startTyping(msg);

      const kissFetch = await fetch('https://nekos.life/api/v2/img/kiss');
      const kissImg = await kissFetch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        color: msg.guild ? msg.guild.me.displayColor : 10610610,
        description: member
          ? `${member.displayName}! You were kissed by ${msg.member.displayName} 💋!` : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member ? kissImg.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
      }, `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a kiss image 💔');
    }
  }

}