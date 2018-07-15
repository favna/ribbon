/**
 * @file Weeb PokeCommand - Poke an annoying person 👉!  
 * @module
 * @category weeb
 * @name poke
 * @example poke Weiss
 * @param {GuildMemberResolvable} [MemberToPoke] Name of the member you want to poke
 * @returns {MessageEmbed} The poke and an image
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class PokeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'poke',
      memberName: 'poke',
      group: 'weeb',
      description: 'Poke an annoying person 👉!',
      format: 'MemberToPoke',
      examples: ['poke Weiss'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to poke?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run (msg, {member}) {
    try {
      startTyping(msg);

      const {body} = await request.get('https://nekos.life/api/v2/img/poke');

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed({
        description: member
          ? `${member.displayName}! You got poked by ${msg.member.displayName} 👉!` : `${msg.member.displayName} you must feel alone... Have a 🐈`,
        image: {url: member ? body.url : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610
      }, `<@${member ? member.id : msg.author.id}>`);
    } catch (err) {
      stopTyping(msg);

      return msg.reply('something went wrong getting a poke image 💔');
    }
  }
};