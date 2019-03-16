/**
 * @file Owner CheckGuildsCommand - Lists all guilds Ribbon is in
 * @module
 * @category owner
 * @name checkguilds
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { stripIndents } from 'common-tags';

export default class CheckGuildsCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'checkguilds',
            group: 'owner',
            memberName: 'checkguilds',
            description: 'Check the current guild count and their names',
            guildOnly: false,
            ownerOnly: true,
        });
    }

    public run (msg: CommandoMessage) {
        const guildList = this.client.guilds.map(m => `${m.name} (${m.id})`);
        global.console.log('test');

        return msg.say(stripIndents`
            \`\`\`
                The current guild count: ${this.client.guilds.size}

                Guild list:
                ${guildList.join('\n')}
            \`\`\`
            `, { split: true }
        );
    }
}
