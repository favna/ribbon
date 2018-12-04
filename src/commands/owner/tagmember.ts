/**
 * @file Owner TagMemberCommand - Tags a member by ID
 *
 * Primarily meant for mobile and when members have annoying untaggable names
 * @module
 * @category owner
 * @name tagmember
 * @example tagmember ☜(⌒▽⌒)☞guy
 * @param {GuildMemberResolvable} AnyMember Member to make a mention to
 */

import { GuildMember } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import {
    deleteCommandMessages,
    startTyping,
    stopTyping,
} from '../../components';

export default class TagMemberCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'tagmember',
            group: 'owner',
            memberName: 'tagmember',
            description: 'Tag a member',
            format: 'MemberID|MemberName(partial or full)',
            examples: ['tagmember Favna'],
            guildOnly: false,
            ownerOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What user would you like to snoop on?',
                    type: 'member',
                },
            ],
        });
    }

    public run(msg: CommandoMessage, { member }: { member: GuildMember }) {
        startTyping(msg);
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.say(`^^^^ <@${member.id}> ^^^^`);
    }
}
