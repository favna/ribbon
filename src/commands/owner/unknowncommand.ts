/**
 * @file Owner UnknownCommandCommand - Runs when an unknown command is used
 * @module
 * @category owner
 * @name unknowncommand
 */

import dym, { ReturnTypeEnums } from 'didyoumean2';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class UnknownCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'unknowncommand',
            group: 'owner',
            memberName: 'unknowncommand',
            description: 'Runs when an unknown command is used',
            guildOnly: false,
            ownerOnly: true,
            unknown: true,
        });
    }

    public run (msg: CommandoMessage) {
        if (msg.guild.settings.get('unknownmessages', true)) {
            const commandsAndAliases = this.client.registry.commands.map((command: Command) => command.name).concat(this.client.registry.commands.map((command: Command) => command.aliases).flat());
            const maybe = dym(msg.cleanContent.split(' ')[0], commandsAndAliases, { deburr: true, returnType: ReturnTypeEnums.ALL_SORTED_MATCHES }) as string[];
            const returnStr = [
                `Unknown command. Use \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}help\` or <@${this.client.user.id}> help to view the command list.`,
                '',
                `Server staff (those who can manage other's messages) can disable these replies by using\`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}unknownmessages disable\``
            ];

            if (maybe.length) returnStr[1] = `Maybe you meant one of the following: ${maybe.map(val => `\`${val}\``).join(', ')}?`;
            return msg.reply(returnStr.filter(Boolean).join('\n'));
        }

        return msg.reply(`Unknown command. Use \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}help\` or <@${this.client.user.id}> help to view the command list.`);
    }
}
