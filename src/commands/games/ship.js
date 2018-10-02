/**
 * @file Games ShipCommand - Ship 2 members  
 * Leaving 1 or both parameters out will have Ribbon randomly pick 1 or 2 members  
 * **Aliases**: `love`, `marry`, `engage`
 * @module
 * @category games
 * @name ship
 * @example ship Biscuit Rei
 * @param {StringResolvable} [ShipMemberOne] The first member to ship
 * @param {StringResolvable} [ShipMemberTwo] The second member to ship
 * @returns {MessageEmbed} Name of the ship
 */

/* eslint-disable no-unused-vars*/
const Jimp = require('jimp'),
  {promisify} = require('util'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed, MessageAttachment} = require('discord.js'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages, roundNumber, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class ShipCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ship',
      memberName: 'ship',
      group: 'games',
      aliases: ['love', 'marry', 'engage'],
      description: 'Ship 2 members',
      details: 'Leaving 1 or both parameters out will have Ribbon randomly pick 1 or 2 members',
      format: 'ShipMemberOne ShipMemberTwo',
      examples: ['ship Biscuit Rei'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'romeo',
          prompt: 'Who to ship?',
          type: 'member',
          default: 'random'
        },
        {
          key: 'juliet',
          prompt: 'And who to ship them with?',
          type: 'member',
          default: 'random'
        }
      ]
    });
  }

  async run (msg, {romeo, juliet}) {
    startTyping(msg);
    romeo = romeo !== 'random' ? romeo.user : msg.guild.members.random().user;
    juliet = juliet !== 'random' ? juliet.user : msg.guild.members.random().user;

    const avaOne = await Jimp.read(romeo.displayAvatarURL({format: 'png'})),
      avaTwo = await Jimp.read(juliet.displayAvatarURL({format: 'png'})),
      boat = new MessageEmbed(),
      canvas = await Jimp.read(384, 128),
      heart = await Jimp.read('https://favna.xyz/images/ribbonhost/heart.png'),
      randLengthRomeo = roundNumber((Math.random() * 4) + 2),
      randLengthJuliet = roundNumber((Math.random() * 4) + 2);

    avaOne.resize(128, Jimp.AUTO);
    avaTwo.resize(128, Jimp.AUTO);

    canvas.blit(avaOne, 0, 0);
    canvas.blit(avaTwo, 256, 0);
    canvas.blit(heart, 160, 32);

    // eslint-disable-next-line one-var
    const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG),
      embedAttachment = new MessageAttachment(buffer, 'ship.png');

    boat
      .attachFiles([embedAttachment])
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setTitle(`Shipping ${romeo.username} and ${juliet.username}`)
      .setDescription(oneLine`I call it... 
            ${romeo.username.substring(0, roundNumber(romeo.username.length / randLengthRomeo))}${juliet.username.substring(roundNumber(juliet.username.length / randLengthJuliet))}! 😘`)
      .setImage('attachment://ship.png');

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(boat);
  }
};