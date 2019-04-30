/**
 * @file Moderation DeleteCommandMessagesCommand - Configure whether Ribbon should delete command messages
 *
 * **Aliases**: `dcm`
 * @module
 * @category moderation
 * @name deletecommandmessages
 * @example deletecommandmessages enable
 * @param {boolean} Option True or False
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine } from 'common-tags';

type DeleteCommandMessagesArgs = {
    shouldEnable: boolean;
};

export default class DeleteCommandMessagesCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'deletecommandmessages',
            aliases: ['dcm'],
            group: 'moderation',
            memberName: 'deletecommandmessages',
            description:
                'Configure whether Ribbon should delete command messages',
            format: 'boolean',
            examples: ['deletecommandmessages enable'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'shouldEnable',
                    prompt: 'Enable or disable deleting of command messages?',
                    type: 'validboolean',
                }
            ],
        });
    }

    @shouldHavePermission('MANAGE_MESSAGES', true)
    public run (msg: CommandoMessage, { shouldEnable }: DeleteCommandMessagesArgs) {
        const dcmEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        msg.guild.settings.set('deletecommandmessages', shouldEnable);

        dcmEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
            .setDescription(oneLine`**Action:** Deleting of command messages is now ${shouldEnable ? 'enabled' : 'disabled'}`)
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, dcmEmbed);
        }

        deleteCommandMessages(msg, this.client);

        return msg.embed(dcmEmbed);
    }
}
