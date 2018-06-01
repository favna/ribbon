/**
 * @file Games StrawpollCommand - Create a strawpoll and find out what people really think (hopefully)  
 * Has a very specific syntax! Be sure to adapt the example!  
 * **Aliases**: `straw`, `poll`
 * @module
 * @category games
 * @name strawpoll
 * @example strawpoll "Best Anime Waifu?" "Pyrrha Nikos|Ruby Rose"
 * @param {StringResolvable} Question The question that the strawpoll needs to answer. Recommended to wrap in `" "` (or `' '`) to allow spaces
 * @param {StringResolvable} Options The options the strawpoll should have. Recommended to wrap in `" "` (or `' '`) to allow spaces. Splits on every \`|\`
 * @returns {MessageEmbed} Poll url, title, options and preview image
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class StrawpollCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'strawpoll',
      memberName: 'strawpoll',
      group: 'games',
      aliases: ['straw', 'poll'],
      description: 'Strawpoll something. Recommended to use the replying with each argument method to allow spaces in the title',
      details: 'Has a very specific syntax! Be sure to adapt the example!',
      format: 'TitleOfStrawpoll OptionA|OptionB|OptionC...',
      examples: ['strawpoll "Best Anime Waifu?" "Pyrrha Nikos|Ruby Rose"'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'title',
          prompt: 'Title of the strawpoll',
          type: 'string'
        },
        {
          key: 'options',
          prompt: 'What are the messages for the strawpoll (minimum is 2)? Send 1 option per message and end with `finish`',
          type: 'string',
          infinite: true,
          validate: (v) => {
            console.log(v);
            
            return true;
          }
        }
      ]
    });
  }

  async run (msg, {title, options}) {
    if (options.length < 2) {
      return msg.reply('a poll needs to have at least 2 options to pick from');
    }
    try {
      startTyping(msg);
      const pollEmbed = new MessageEmbed(),
        strawpoll = await request
          .post('https://www.strawpoll.me/api/v2/polls')
          .set('Content-Type', 'application/json')
          .send({
            title,
            options,
            multi: false,
            dupcheck: 'normal',
            captcha: true
          });

      pollEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(strawpoll.body.title)
        .setURL(`http://www.strawpoll.me/${strawpoll.body.id}`)
        .setImage(`http://www.strawpoll.me/images/poll-results/${strawpoll.body.id}.png`)
        .setDescription(`Options on this poll: ${strawpoll.body.options.map(val => `\`${val}\``).join(', ')}`);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(pollEmbed, `http://www.strawpoll.me/${strawpoll.body.id}`);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('an error occurred creating the strawpoll');
    }
  }
};