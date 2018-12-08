/**
 * @file Searches LmgtfyCommand - Transform some query into a LMGTFY (Let Me Google That For You) url
 *
 * **Aliases**: `dumb`
 * @module
 * @category searches
 * @name lmgtfy
 * @example lmgtfy is it legal to kill an ant???
 * @param {string} SearchQuery The dumb sh*t people need to use google for
 */

import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class LmgtfyCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'lmgtfy',
            aliases: ['dumb'],
            group: 'searches',
            memberName: 'lmgtfy',
            description: 'Produce a lmgtfy (let me google that for you) URL',
            format: 'Query',
            examples: ['lmgtfy is it legal to kill an ant???', 'lmgtfy are there birds in canada?'],
            guildOnly: false,
            throttling: {
                usages: 2,
                duration: 3,
            },
            args: [
                {
                    key: 'question',
                    prompt: 'What does the idiot want to find?',
                    type: 'string',
                    parse: (p: string) => p.replace(/ /gim, '+'),
                }
            ],
        });
    }

    public run (msg: CommandoMessage, { question }: { question: string }) {
        startTyping(msg);
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.say(`<https://lmgtfy.com/?q=${question}>`);
    }
}
