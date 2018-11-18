/**
 * @file Weeb TickleCommand - TICKLE WAR 😂!!  
 * @module
 * @category weeb
 * @name tickle
 * @example tickle Yang
 * @param {GuildMemberResolvable} [MemberToTickle] Name of the member you want to tickle
 * @returns {MessageEmbed} The tickling and a cute image ❤
 */

import { GuildMember } from 'discord.js';
import {Command, CommandoClient, CommandoMessage} from 'discord.js-commando';
import fetch from 'node-fetch';
import {deleteCommandMessages, startTyping, stopTyping} from '../../components/util';

export default class TickleCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'tickle',
      group: 'weeb',
      memberName: 'tickle',
      description: 'TICKLE WAR 😂!!',
      format: 'MemberToTickle',
      examples: ['tickle Yang'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to tickle?',
          type: 'member',
          default: '',
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, {member}: {member: GuildMember}) {
    try {
      startTyping(msg);

      const tickleFetch = await fetch('https://nekos.life/api/v2/img/tickle');
      const tickleImg = await tickleFetch.json();

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        color: msg.guild ? msg.guild.me.displayColor : 10610610,
        description: member
          ? `${member.displayName}! You were tickled by ${msg.member.displayName}, tickle them back!!!`
          : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member ? tickleImg.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
      }, `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a tickle image 💔');
    }
  }
}