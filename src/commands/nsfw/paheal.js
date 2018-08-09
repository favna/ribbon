/**
 * @file nsfw PahealCommand - Gets a NSFW image from paheal  
 * Can only be used in NSFW marked channels!  
 * **Aliases**: `pa`, `heal`
 * @module
 * @category nsfw
 * @name paheal
 * @example paheal pyrrha_nikos
 * @param {StringResolvable} Query Something you want to find
 * @returns {MessageEmbed} Score, Link and preview of the image
 */

const booru = require('booru'),
  {MessageEmbed} = require('discord.js'),
  {Command} = require('discord.js-commando'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class PahealCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'paheal',
      memberName: 'paheal',
      group: 'nsfw',
      aliases: ['pa', 'heal'],
      description: 'Find NSFW Content on Rule34 - Paheal',
      format: 'NSFWToLookUp',
      examples: ['paheal Pyrrha Nikos'],
      guildOnly: false,
      nsfw: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'tags',
          prompt: 'What do you want to find NSFW for?',
          type: 'string',
          parse: p => p.split(' ')
        }
      ]
    });
  }

  async run (msg, {tags}) {
    try {
      startTyping(msg);

      const search = await booru.search('paheal', tags, {
          limit: 1,
          random: true
        }),
        common = await booru.commonfy(search),
        embed = new MessageEmbed(),
        imageTags = [];

      for (const tag in common[0].common.tags) {
        imageTags.push(`[#${common[0].common.tags[tag]}](${common[0].common.file_url})`);
      }

      embed
        .setTitle(`paheal image for ${tags.join(', ')}`)
        .setURL(common[0].common.file_url)
        .setColor('#FFB6C1')
        .setDescription(stripIndents`${imageTags.slice(0, 5).join(' ')}
          
          **Score**: ${common[0].common.score}`)
        .setImage(common[0].common.file_url);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(embed);

    } catch (err) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(`no juicy images found for \`${tags}\``);
    }
  }
};