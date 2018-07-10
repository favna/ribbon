/**
 * @file Weeb PatCommand - Pat a good person 🐇!  
 * @module
 * @category weeb
 * @name pat
 * @example pat Ruby
 * @param {GuildMemberResolvable} [MemberToPat] Name of the member you want to pat
 * @returns {MessageEmbed} The pat and an image
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {
    deleteCommandMessages,
    stopTyping,
    startTyping
  } = require('../../components/util.js');

module.exports = class PatCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pat',
      memberName: 'pat',
      group: 'weeb',
      description: 'Pat a good person 🐇!',
      format: 'MemberToPat',
      examples: ['pat Favna'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to pat?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run (msg, {member}) {
    try {
      startTyping(msg);

      const {body} = await request.get('https://nekos.life/api/v2/img/pat');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member !== ''
          ? `${member.displayName}! You got patted by ${msg.member.displayName} 🐇!`
          : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member !== '' ? body.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a pat image 💔');
    }
  }
};