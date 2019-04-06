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

import { deleteCommandMessages, startTyping, stopTyping } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageAttachment, MessageEmbed } from 'awesome-djs';
import { stripIndents } from 'common-tags';
import jimp from 'jimp';

export default class RandomColCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'randomcol',
            aliases: ['randhex', 'rhex', 'randomcolour', 'randomcolor', 'randcol', 'randomhex'],
            group: 'extra',
            memberName: 'randomcol',
            description: 'Generate a random colour',
            format: '[hex colour]',
            examples: ['randomcol', 'randomcol #990000', 'randomcol 36B56e'],
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

    public async run (msg: CommandoMessage, { colour }: { colour: string }) {
        startTyping(msg);
        const embed = new MessageEmbed();
        const hex = colour !== 'random'
            ? colour
            : `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        const canvas = await jimp.read(80, 50, this.hextodec(hex.replace('#', '0x').concat('FF')));
        const buffer = await canvas.getBufferAsync(jimp.MIME_PNG);
        const embedAttachment = new MessageAttachment(buffer, 'canvas.png');

        embed
            .attachFiles([embedAttachment])
            .setColor(hex)
            .setThumbnail('attachment://canvas.png')
            .setDescription(stripIndents`
                **hex**: ${hex}
                **dec**: ${this.hextodec(hex)}
                **rgb**: rgb(${this.hextorgb(hex).r}, ${this.hextorgb(hex).g}, ${this.hextorgb(hex).b})
            `);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(embed);
    }

    private hextodec (colour: string) {
        return parseInt(colour.replace('#', ''), 16);
    }

    private hextorgb (colour: string): { r: number, g: number, b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d])*$/i.exec(colour);

        if (result) {
            return {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            };
        }
        return { r: 0, g: 0, b: 0 };
    }
}
