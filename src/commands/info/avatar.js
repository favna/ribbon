/**
 * @file Games AvatarCommand - Get the avatar from any member on this server 
 * **Aliases**: `ava`
 * @module
 * @category info
 * @name avatar
 * @example avatar Favna
 * @param {GuildMemberResolvable} MemberName Member to get the avatar from
 * @param {GuildMemberResolvable} [ImageSize] Optional: Size of the avatar to get. Defaults to 1024
 * @returns {MessageEmbed} The avatar image and a direct link to it
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'),
  {stripIndents} = require('common-tags'),
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'avatar',
      memberName: 'avatar',
      group: 'info',
      aliases: ['ava'],
      description: 'Gets the avatar from a user',
      format: 'MemberID|MemberName(partial or full) [ImageSize]',
      examples: ['avatar Favna 2048'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'member',
          prompt: 'What user would you like to get the avatar from?',
          type: 'member'
        },
        {
          key: 'size',
          prompt: 'What size do you want the avatar to be? (Valid sizes: 128, 256, 512, 1024, 2048)',
          type: 'integer',
          default: 1024,
          validate: (size) => {
            const validSizes = ['128', '256', '512', '1024', '2048'];

            if (validSizes.includes(size)) {
              return true;
            }

            return stripIndents`Has to be one of ${validSizes.map(val => `\`${val}\``).join(', ')}
            Respond with your new selection or`;
          }
        }
      ]
    });
  }

  fetchExt (str) {
    return str.substring(str.length - 14, str.length - 8);
  }

  run (msg, {member, size}) {
    startTyping(msg);
    const ava = member.user.displayAvatarURL({size}),
      embed = new MessageEmbed(),
      ext = this.fetchExt(ava);

    embed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setImage(ext.includes('gif') ? `${ava}&f=.gif` : ava)
      .setTitle(member.displayName)
      .setURL(ava)
      .setDescription(`[Direct Link](${ava})`);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(embed);
  }
};