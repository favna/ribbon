/**
 * @file Games ShipCommand - Ship 2 members
 *
 * Leaving 1 or both parameters out will have Ribbon randomly pick 1 or 2 members
 *
 * **Aliases**: `love`, `marry`, `engage`
 * @module
 * @category games
 * @name ship
 * @example ship Biscuit Rei
 * @param {StringResolvable} [ShipMemberOne] The first member to ship
 * @param {StringResolvable} [ShipMemberTwo] The second member to ship
 */

import { oneLine } from 'common-tags';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import * as Jimp from 'jimp';
import { deleteCommandMessages, roundNumber, startTyping, stopTyping } from '../../components';

export default class ShipCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'ship',
            aliases: ['love', 'marry', 'engage'],
            group: 'games',
            memberName: 'ship',
            description: 'Ship 2 members',
            format: 'ShipMemberOne ShipMemberTwo',
            details: 'Leaving 1 or both parameters out will have Ribbon randomly pick 1 or 2 members',
            examples: ['ship Biscuit Rei'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'romeo',
                    prompt: 'Who to ship?',
                    type: 'member',
                    default: 'random',
                },
                {
                    key: 'juliet',
                    prompt: 'And who to ship them with?',
                    type: 'member',
                    default: 'random',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { romeo, juliet }: { romeo: any; juliet: any }) {
        startTyping(msg);
        romeo = romeo !== 'random' ? romeo.user : msg.guild.members.random().user;
        juliet = juliet !== 'random' ? juliet.user : msg.guild.members.random().user;

        const avaOne = await Jimp.read(romeo.displayAvatarURL({ format: 'png' }));
        const avaTwo = await Jimp.read(juliet.displayAvatarURL({ format: 'png' }));
        const boat = new MessageEmbed();
        const canvas = await Jimp.read(384, 128);
        const heart = await Jimp.read('https://favna.xyz/images/ribbonhost/heart.png');
        const randLengthRomeo = roundNumber(Math.random() * 4 + 2);
        const randLengthJuliet = roundNumber(Math.random() * 4 + 2);

        avaOne.resize(128, Jimp.AUTO);
        avaTwo.resize(128, Jimp.AUTO);

        canvas.blit(avaOne, 0, 0);
        canvas.blit(avaTwo, 256, 0);
        canvas.blit(heart, 160, 32);

        const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
        const embedAttachment = new MessageAttachment(buffer, 'ship.png');

        boat.attachFiles([embedAttachment])
            .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
            .setTitle(`Shipping ${romeo.username} and ${juliet.username}`)
            .setDescription(oneLine`
                I call it...
                ${romeo.username.substring(0, roundNumber(romeo.username.length / randLengthRomeo))}
                ${juliet.username.substring(roundNumber(juliet.username.length / randLengthJuliet))}! 😘`
            )
            .setImage('attachment://ship.png');

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(boat);
    }
}
