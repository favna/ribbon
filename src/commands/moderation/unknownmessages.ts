/**
 * @file Moderation UnknownMessagesCommand - Toggle Unknown Command messages on or off
 *
 * **Aliases**: `unknowns`, `unkmsg`
 * @module
 * @category moderation
 * @name unknownmessages
 * @example unknownmessages enable
 * @param {boolean} Option True or False
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission, startTyping, stopTyping, validateBool } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';

export default class UnknownMessagesCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'unknownmessages',
            aliases: ['unkmsg', 'unknowns'],
            group: 'moderation',
            memberName: 'unknownmessages',
            description: 'Toggle Unknown Command messages on or off',
            format: 'boolean',
            examples: ['unknownmessages enable'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'option',
                    prompt: 'Enable or disable Unknown Command messages?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                }
            ],
        });
    }

    @shouldHavePermission('MANAGE_MESSAGES')
    public run (msg: CommandoMessage, { option }: { option: boolean }) {
        startTyping(msg);

        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const ukmEmbed = new MessageEmbed();

        msg.guild.settings.set('unknownmessages', option);

        ukmEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(`**Action:** Unknown command response messages are now ${option ? 'enabled' : 'disabled'}`)
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, ukmEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(ukmEmbed);
    }
}
