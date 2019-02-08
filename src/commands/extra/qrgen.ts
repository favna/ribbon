/**
 * @file Extra QRGenCommand - Generates a QR code from text (like a URL)
 *
 * **Aliases**: `qr`, `qrcode`
 * @module
 * @category extra
 * @name qrgen
 * @example qrgen https://favna.xyz/ribbon
 * @param {string} URL URL you want to encode into a QR image
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageAttachment, MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { toDataURL as qr } from 'qrcode';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class QRGenCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'qrgen',
            aliases: ['qr', 'qrcode'],
            group: 'extra',
            memberName: 'qrgen',
            description: 'Generates a QR code from text (like a URL)',
            format: 'TextToEncode',
            examples: ['qrgen https://github.com/Favna/Ribbon'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'url',
                    prompt: 'Text to make a QR code for?',
                    type: 'string',
                }
            ],
        });
    }

    public async run (msg: CommandoMessage, { url }: { url: string }) {
        try {
            startTyping(msg);
            const base64 = await qr(url, { type: 'image/jpeg', rendererOpts: { quality: 1 } });
            const buffer = Buffer.from(base64.replace(/^data:image\/png;base64,/, '').toString(), 'base64');
            const embedAttachment = new MessageAttachment(buffer, 'qrcode.png');
            const qrEmbed = new MessageEmbed();

            qrEmbed
                .attachFiles([embedAttachment])
                .setTitle(`QR code for ${url}`)
                .setImage('attachment://qrcode.png');

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.embed(qrEmbed);
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID) as TextChannel;

            channel.send(stripIndents`
                <@${this.client.owners[0].id}> Error occurred in \`qr\` command!
                **Server:** ${msg.guild.name} (${msg.guild.id})
                **Author:** ${msg.author.tag} (${msg.author.id})
                **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
                **Error Message:** ${err}
            `);

            return msg.reply(oneLine`An unknown and unhandled error occurred but I notified ${this.client.owners[0].username}
                Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
        }
    }
}
