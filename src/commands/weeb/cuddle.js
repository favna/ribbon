/**
 * @file Weeb CuddleCommand - Cuuuuddlleeesss!! 💕!  
 * @module
 * @category weeb
 * @name cuddle
 * @example cuddle Velvet
 * @param {GuildMemberResolvable} [MemberToCuddle] Name of the member you want to cuddle
 * @returns {MessageEmbed} The cuddle and a cute image 💕
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class CuddleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'cuddle',
      memberName: 'cuddle',
      group: 'weeb',
      description: 'Cuuuuddlleeesss!! 💕!',
      format: '[MemberToCuddle]',
      examples: ['cuddle Velvet'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to cuddle?',
          type: 'member',
          default: ''
        }
      ]
    });
  }


  async run (msg, {member}) {
    try {
      startTyping(msg);

      const {body} = await request.get('https://nekos.life/api/v2/img/cuddle');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member !== ''
          ? `${member.displayName}! You were cuddled by ${msg.member.displayName} 💕!`
          : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member !== '' ? body.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a cuddle image 💔');
    }
  }

};