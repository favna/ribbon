/**
 * @file Streamwatch TwitchToggleCommand - Killswitch for Twitch notifications
 *
 * **Aliases**: `twitchon`, `twitchoff`
 * @module
 * @category streamwatch
 * @name twitchtoggle
 * @example twitchtoggle enable
 * @param {boolean} Option True or False
 */

import { deleteCommandMessages, shouldHavePermission, startTyping, stopTyping, validateBool } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { oneLine } from 'common-tags';

export default class TwitchToggleCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'twitchtoggle',
            aliases: ['twitchon', 'twitchoff'],
            group: 'streamwatch',
            memberName: 'twitchtoggle',
            description: 'Configures whether Twitch Notifications are enabled',
            format: 'boolean',
            details: 'This is a killswitch for the entire module!',
            examples: ['twitchtoggle enable'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'option',
                    prompt: 'Enable or disable twitch monitoring?',
                    type: 'boolean',
                    validate: (bool: boolean) => validateBool(bool),
                }
            ],
        });
    }

    @shouldHavePermission('ADMINISTRATOR')
    public run (msg: CommandoMessage, { option }: { option: boolean }) {
        startTyping(msg);
        msg.guild.settings.set('twitchnotifiers', option);

        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply(oneLine`Twitch Notifiers have been
            ${option
            ? `enabled.
                    Please make sure to set the output channel with \`${msg.guild.commandPrefix}twitchoutput\`and configure which users to monitor with \`${msg.guild.commandPrefix}twitchmonitors\` `
            : 'disabled.'}.
        `);
    }
}
