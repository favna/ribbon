/**
 * @file Moderation DeleteCommandMessagesCommand - Configure whether Ribbon should delete command messages
 *
 * **Aliases**: `dcm`
 * @module
 * @category moderation
 * @name deletecommandmessages
 * @example deletecommandmessages enable
 * @param {BooleanResolvable} Option True or False
 */

import { oneLine } from 'common-tags';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, modLogMessage, startTyping, stopTyping, validateBool } from '../../components';

export default class DeleteCommandMessagesCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'deletecommandmessages',
            aliases: ['dcm'],
            group: 'moderation',
            memberName: 'deletecommandmessages',
            description:
                'Configure whether Ribbon should delete command messages',
            format: 'BooleanResolvable',
            examples: ['deletecommandmessages enable'],
            guildOnly: true,
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'option',
                    prompt: 'Enable or disable deleting of command messages?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { option }: { option: boolean }) {
        startTyping(msg);

        const dcmEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        msg.guild.settings.set('deletecommandmessages', option);

        dcmEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(oneLine`**Action:** Deleting of command messages is now ${option ? 'enabled' : 'disabled'}`)
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, dcmEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(dcmEmbed);
    }
}
