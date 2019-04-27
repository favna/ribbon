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
import { MessageEmbed } from 'awesome-djs';
import { oneLine } from 'common-tags';
import moment from 'moment';

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
        const saydata = msg.guild.settings.get('saydata', null);
        const wutEmbed = new MessageEmbed();

        if (saydata) {
            wutEmbed
                .setColor(saydata.memberHexColor)
                .setTitle(`Last ${saydata.commandPrefix}say message author`)
                .setAuthor(oneLine`${saydata.authorTag} (${saydata.authorID})`, saydata.avatarURL)
                .setDescription(saydata.argString)
                .setTimestamp(moment(saydata.messageDate).toDate());

            deleteCommandMessages(msg, this.client);

            return msg.embed(wutEmbed);
        }
        deleteCommandMessages(msg, this.client);

        return msg.reply(`couldn't fetch message for your server. Has anyone used the ${msg.guild.commandPrefix}say command before?`
        );
    }
}
