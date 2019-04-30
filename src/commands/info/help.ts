/**
 * @file Info HelpCommand - Displays a list of available commands, or detailed information for a specified command
 *
 * The command may be part of a command name or a whole command name. If it isn't specified, all available commands will be listed.
 *
 * **Aliases**: `?`, `commands`
 * @module
 * @category info
 * @name help
 * @example help
 * @example help all
 * @example help avatar
 * @param {string} [CommandName || All] Command name to get info for, nothing for the default or all to get all commands
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage, util } from 'awesome-commando';
import { Message, Util as DJSUtil } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';

type HelpArgs = {
    command: string;
};

export default class HelpCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'help',
            aliases: ['?', 'commands'],
            group: 'info',
            memberName: 'help',
            description: 'Displays a list of available commands, or detailed information for a specified command.',
            details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
            `,
            examples: ['help', 'help all', 'help avatar'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'command',
                    prompt: 'Which command would you like to view the help for?',
                    type: 'string',
                    default: '',
                }
            ],
            guarded: true,
        });
    }

    // tslint:disable-next-line:cyclomatic-complexity
    public async run (msg: CommandoMessage, { command = '' }: HelpArgs) {
        try {
            const groups = this.client.registry.groups;
            const commands = this.client.registry.findCommands(command, false, msg);
            const showAll = command && command.toLowerCase() === 'all';

            let messages: Message[] = [];

            if (command && !showAll) {
                if (commands.length === 1) {
                    let help = stripIndents`
                            ${oneLine`
                                __Command **${commands[0].name}**:__ ${commands[0].description}
                                ${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
                                ${commands[0].nsfw ? ' (NSFW)' : ''}
                            `}

                            **Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
                        `;
                    if (commands[0].aliases.length > 0) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
                    help += `\n${oneLine`
                            **Group:** ${commands[0].group.name}
                            (\`${commands[0].groupID}:${commands[0].memberName}\`)
                        `}`;
                    if (commands[0].details) help += `\n**Details:** ${commands[0].details}`;
                    if (commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

                    try {
                        messages.push(await msg.embed({
                            description: help,
                            color: msg.guild ? msg.guild.me!.displayColor : this.hextodec(DEFAULT_EMBED_COLOR),
                        }) as Message);
                    } catch (err) {
                        messages.push(await msg.reply('Unable to send the help message.') as Message);
                    }

                    this.endHelpCommand(msg, this.client);
                    return messages;
                }
                if (commands.length > 15) {
                    this.endHelpCommand(msg, this.client);
                    return msg.reply('Multiple commands found. Please be more specific.');
                }
                if (commands.length > 1) {
                    this.endHelpCommand(msg, this.client);
                    return msg.reply(util.disambiguation(commands, 'commands'));
                }

                this.endHelpCommand(msg, this.client);

                return msg.reply(
                    `Unable to identify command. Use ${msg.usage(
                        undefined, msg.channel.type === 'dm' ? this.client.commandPrefix : msg.guild.commandPrefix, msg.channel.type === 'dm' ? this.client.user! : undefined
                    )} to view the list of all commands.`
                );
            }

            messages = [];
            try {
                const body = stripIndents`
                ${oneLine`
                To run a command in ${msg.guild ? msg.guild.name : 'any server'},
                use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix, this.client.user!)}.
                For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix, this.client.user!)}.`}
                To run a command in this DM, simply use ${Command.usage('command', undefined, undefined)} with no prefix.

                Use ${this.usage('<command>', undefined, undefined)} to view detailed information about a specific command.
                Use ${this.usage('all', undefined, undefined)} to view a list of *all* commands, not just available ones.

                        __**${showAll ? 'All commands' : `Available commands in ${msg.guild || 'this DM'}`}**__

                        ${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))).map(grp => stripIndents`
                            __${grp.name}__
                        ${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))).map(cmd => stripIndents`
                            **${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`)
                    .join('\n')}`).join('\n\n')}`;

                if (body.length >= 2000) {
                    const splitContent = DJSUtil.splitMessage(body) as string[];

                    for (const part in splitContent) {
                        messages.push(await msg.direct('', {
                            embed: {
                                color: msg.guild ? msg.guild.me!.displayColor : this.hextodec(DEFAULT_EMBED_COLOR),
                                description: splitContent[part],
                            },
                        }) as Message);
                    }
                } else {
                    messages.push(await msg.direct('', {
                        embed: {
                            color: msg.guild ? msg.guild.me!.displayColor : this.hextodec(DEFAULT_EMBED_COLOR),
                            description: body,
                        },
                    }) as Message);
                }

                if (msg.channel.type !== 'dm') messages.push(await msg.reply('Sent you a DM with information.') as Message);
            } catch (err) {
                messages.push(await msg.reply('Unable to send you the help DM. You probably have DMs disabled.') as Message);
            }

            this.endHelpCommand(msg, this.client);

            return messages;
        } catch (err) {
            return msg.say('blub');
        }
    }

    private endHelpCommand (msg: CommandoMessage, client: CommandoClient): void {
        deleteCommandMessages(msg, client);
    }

    private hextodec (colour: string) {
        return parseInt(colour.replace('#', ''), 16);
    }
}