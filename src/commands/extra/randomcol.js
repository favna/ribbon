/**
 * @file Extra RandomColCommand - Generates a random color  
 * Providing a color hex will display that color, providing none will generate a random one  
 * **Aliases**: `randhex`, `rhex`, `randomcolor`, `randcol`, `randomhex`
 * @module
 * @category extra
 * @name randomcol
 * @example randomcol  
 * -OR-  
 * randomcol #990000  
 * -OR-  
 * randomcol 36B56e
 * @param {StringResolvable} [hex] Optional: Color hex to display
 * @returns {MessageEmbed} Color of embed matches generated color
 */

const {Canvas} = require('canvas-constructor'), 
  {Command} = require('discord.js-commando'), 
  {MessageEmbed, MessageAttachment} = require('discord.js'), 
  {stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class RandomColCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'randomcol',
      memberName: 'randomcol',
      group: 'extra',
      aliases: ['randhex', 'rhex', 'randomcolor', 'randcol', 'randomhex'],
      description: 'Generate a random color',
      format: '[hex color]',
      examples: ['randomcol', 'randomcol #990000', 'randomcol 36B56e'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'col',
          prompt: 'What color do you want to preview?',
          type: 'string',
          default: 'random',
          validate: (col) => {
            if ((/^#{0,1}(?:[0-9a-fA-F]{6})$/i).test(col) || col === 'random') {
              return true;
            }

            return 'Respond with a hex formatted color of 6 characters, example: `#990000` or `36B56e`';
          },
          parse: (col) => {
            if ((/^#{0}(?:[0-9a-fA-F]{6})$/i).test(col)) {
              return `#${col}`;
            }

            return col;
          }
        }
      ]
    });
  }

  hextodec (color) {
    return parseInt(color.replace('#', ''), 16);
  }

  hextorgb (color) {
    const result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d])*$/i).exec(color);

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  run (msg, {col}) {
    startTyping(msg);
    const embed = new MessageEmbed(),
      hex = col !== 'random' ? col : `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      canv = new Canvas(80, 60)
        .setColor(hex)
        .addRect(0, 0, 100, 60)
        .toBuffer(),
      embedAttachment = new MessageAttachment(canv, 'canvas.png');

    embed
      .attachFiles([embedAttachment])
      .setColor(hex)
      .setThumbnail('attachment://canvas.png')
      .setDescription(stripIndents`**hex**: ${hex}
				**dec**: ${this.hextodec(hex)}
				**rgb**: rgb(${this.hextorgb(hex).r}, ${this.hextorgb(hex).g}, ${this.hextorgb(hex).b})`);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(embed);
  }
};