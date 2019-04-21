/**
 * @file Moderation SetNonExplicitBlockCommand - Toggle whether the bot should block non explicit commands or not
 *
 * Some commands can potentially give NSFW results, however they do not show NSFW images (for example, certain definitions on Urban Dictionary).
 *     These type of commands are considered non explicit, as opposed to full nsfw commands.
 *     By default these commands are blocked outside of NSFW channels, however at staff
 *     digression they can be allowed outside of NSFW channels by toggling this option off
 *
 * **Aliases**: `sub`, `sneb`, `seb`, `allowub`
 * @module
 * @category moderation
 * @name setnonexplicitblock
 * @example setnonexplicitblock off
 * @param {boolean} Option On or Off
 */

import { deleteCommandMessages, logModMessage, startTyping, stopTyping, validateBool } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

export default class SetNonExplicitBlockCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'setnonexplicitblock',
            aliases: ['sub', 'sneb', 'seb', 'allowub'],
            group: 'moderation',
            memberName: 'setnonexplicitblock',
            description: 'Toggle Unknown Command messages on or off',
            format: 'boolean',
            details: stripIndents`Some commands can potentially give NSFW results, however they do not show NSFW images (for example, certain definitions on Urban Dictionary).
                These type of commands are considered non explicit, as opposed to full nsfw commands. By default these commands are blocked outside of NSFW channels,
                however at staff digression they can be allowed outside of NSFW channels by toggling this option off`,
            examples: ['setnonexplicitblock off'],
            guildOnly: true,
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'option',
                    prompt: 'Enable or disable the blocking of non explicit commands in non NSFW channels?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { option }: { option: boolean }) {
        startTyping(msg);

        const modlogChannel = msg.guild.settings.get('modlogchannel', null);
        const snebEmbed = new MessageEmbed();

        msg.guild.settings.set('blockUnexplicitNsfw', option);

        snebEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(`**Action:** Non Explicit commands are now ${option ? 'blocked' : 'allowed'} outside of NSFW channels`)
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, snebEmbed);
        }

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.embed(snebEmbed);
    }
}
