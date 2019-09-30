/**
 * @file Extra RandomColCommand - Generates a random colour
 *
 * Providing a colour hex will display that colour, providing none will generate a random one
 *
 * **Aliases**: `randhex`, `rhex`, `randomcolour`, `randomcolor`, `randcol`, `randomhex`
 * @module
 * @category extra
 * @name randomcol
 * @example randomcol
 * -OR-
 * randomcol #990000
 * -OR-
 * randomcol 36B56e
 * @param {string} [hex] Optional: colour hex to display
 */

import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { deleteCommandMessages } from '@components/Utils';
import jimp from 'jimp';
import { stripIndents } from 'common-tags';

interface RandomColArgs {
  colour: string;
}

export default class RandomColCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'randomcol',
      aliases: [ 'randhex', 'rhex', 'randomcolour', 'randomcolor', 'randcol', 'randomhex' ],
      group: 'extra',
      memberName: 'randomcol',
      description: 'Generate a random colour',
      format: '[hex colour]',
      examples: [ 'randomcol', 'randomcol #990000', 'randomcol 36B56e' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'colour',
          prompt: 'What colour do you want to preview?',
          type: 'string',
          default: 'random',
          validate: (col: string) => {
            if (/^#?(?:[0-9a-fA-F]{6})$/i.test(col) || col === 'random') {
              return true;
            }

            return 'Respond with a hex formatted colour of 6 characters, example: `#990000` or `36B56e`';
          },
          parse: (colour: string) => {
            if (/^#{0}(?:[0-9a-fA-F]{6})$/i.test(colour)) {
              return `#${colour}`;
            }

            return colour;
          },
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { colour }: RandomColArgs) {
    const embed = new MessageEmbed();
    const hex = colour === 'random'
      ? `#${Math.floor(Math.random() * 16777215).toString(16)}`
      : colour;
    const canvas = await jimp.read(80, 50, this.hextodec(hex.replace('#', '0x').concat('FF')));
    const buffer = await canvas.getBufferAsync(jimp.MIME_PNG);
    const embedAttachment = new MessageAttachment(buffer, 'canvas.png');

    embed
      .attachFiles([ embedAttachment ])
      .setColor(hex)
      .setThumbnail('attachment://canvas.png')
      .setDescription(stripIndents`
        **hex**: ${hex}
        **dec**: ${this.hextodec(hex)}
        **rgb**: rgb(${this.hextorgb(hex).red}, ${this.hextorgb(hex).green}, ${this.hextorgb(hex).blue})`);

    deleteCommandMessages(msg, this.client);

    return msg.embed(embed);
  }

  private hextodec(colour: string) {
    return parseInt(colour.replace('#', ''), 16);
  }

  private hextorgb(colour: string): { red: number; green: number; blue: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d])*$/i.exec(colour);

    if (result) {
      return {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
      };
    }

    return { red: 0, green: 0, blue: 0 };
  }
}