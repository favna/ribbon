/**
 * @file Extra SayWutCommand - Bust the last "say" user
 *
 * **Aliases**: `saywat`, `saywot`
 * @module
 * @category extra
 * @name saywut
 */

import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageAttachment, MessageEmbed } from 'awesome-djs';
import { oneLine } from 'common-tags';
import moment from 'moment';
import { SayData } from 'RibbonTypes';

export default class SayWutCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'saywut',
            aliases: ['saywat', 'saywot'],
            group: 'extra',
            memberName: 'saywut',
            description: 'Bust the last "say" user',
            examples: ['saywut'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
    }

    public run (msg: CommandoMessage) {
        const saydata: SayData = msg.guild.settings.get('saydata', null);

        if (saydata) {
            const wutEmbed = new MessageEmbed()
                .setColor(saydata.memberHexColor)
                .setTitle(`Last ${saydata.commandPrefix}say message author`)
                .setAuthor(oneLine`${saydata.authorTag} (${saydata.authorID})`, saydata.avatarURL)
                .setDescription(saydata.argString)
                .setTimestamp(moment(saydata.messageDate).toDate());

            if (saydata.attachment) {
                const attachmentExtension = saydata.attachment.split('.').pop();
                const embedAttachment = new MessageAttachment(saydata.attachment, `say_image.${attachmentExtension}`);
                wutEmbed
                    .attachFiles([embedAttachment])
                    .setImage(`attachment://say_image.${attachmentExtension}`);
            }

            deleteCommandMessages(msg, this.client);

            return msg.embed(wutEmbed);
        }
        deleteCommandMessages(msg, this.client);

        return msg.reply(`couldn't fetch message for your server. Has anyone used the ${msg.guild.commandPrefix}say command before?`
        );
    }
}
