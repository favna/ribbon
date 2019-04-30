/**
 * @file Moderation CasinoLimitCommand - Configure what the upper limit for any casino command should be
 *
 * **Aliases**: `cl`
 * @module
 * @category moderation
 * @name casinolimit
 * @example casinolimit 20000
 * @example casinolimit 20000 1000
 * @param {number} UpperLimit The new upper limit to set
 * @param {number} [LowerLimit] Optional: The new lower limit
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type CasinoLimitArgs = {
    upperlimit: number;
    lowerlimit: number;
};

export default class CasinoLimitCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'casinolimit',
            aliases: ['cl'],
            group: 'moderation',
            memberName: 'casinolimit',
            description: 'Configure what the limits for any casino command should be',
            format: 'casinoUpperLimit casinoLowerLimit',
            examples: ['casinolimit 20000', 'casinolimit 20000 1000'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'upperlimit',
                    prompt: 'What should the new casino upper limit be?',
                    type: 'integer',
                },
                {
                    key: 'lowerlimit',
                    prompt: 'What should the new casino lower limit be?',
                    type: 'integer',
                    default: 1,
                }
            ],
        });
    }

    @shouldHavePermission('MANAGE_MESSAGES')
    public run (msg: CommandoMessage, { upperlimit, lowerlimit }: CasinoLimitArgs) {
        const casinoLimitEmbed = new MessageEmbed();
        const modlogChannel = msg.guild.settings.get('modlogchannel', null);

        msg.guild.settings.set('casinoUpperLimit', upperlimit);
        msg.guild.settings.set('casinoLowerLimit', lowerlimit);

        casinoLimitEmbed
            .setColor('#3DFFE5')
            .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
            .setDescription(stripIndents`
                **Action:** Changed casino limits
                **Lower Limit:** \`${lowerlimit}\`
                **Upper Limit:** \`${upperlimit}\`
            `)
            .setTimestamp();

        if (msg.guild.settings.get('modlogs', true)) {
            logModMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, casinoLimitEmbed);
        }

        deleteCommandMessages(msg, this.client);

        return msg.embed(casinoLimitEmbed);
    }
}
