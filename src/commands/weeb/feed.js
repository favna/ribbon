/**
 * @file Weeb FeedCommand - Feed someone licious food 🍜 😋!  
 * @module
 * @category weeb
 * @name feed
 * @example feed Ren
 * @param {GuildMemberResolvable} [MemberToFeed] Name of the member you want to feed
 * @returns {MessageEmbed} Feeding and a cute image 🍜 😋
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class FeedCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'feed',
      memberName: 'feed',
      group: 'weeb',
      description: 'Feed someone licious food 🍜 😋!',
      format: 'MemberToFeed',
      examples: ['feed Ren'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to feed?',
          type: 'member',
          default: ''
        }
      ]
    });
  }


  async run (msg, {member}) {
    try {
      startTyping(msg);

      const {body} = await request.get('https://nekos.life/api/v2/img/feed');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member
          ? `${member.displayName}! You were fed by ${msg.member.displayName} 🍜 😋!`
          : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member ? body.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a feed image 💔');
    }
  }

};