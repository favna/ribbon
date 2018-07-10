/**
 * @file Weeb KissCommand - Give someone a kiss ❤!  
 * @module
 * @category weeb
 * @name kiss
 * @example kiss Pyrrha
 * @param {GuildMemberResolvable} [MemberToKiss] Name of the member you want to give a kiss
 * @returns {MessageEmbed} The kiss and a cute image ❤
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

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

      const {body} = await request.get('https://nekos.life/api/v2/img/kiss');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member !== ''
          ? `${member.displayName}! You were kissed by ${msg.member.displayName} 💋!`
          : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member !== '' ? body.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a kiss image 💔');
    }
  }

};