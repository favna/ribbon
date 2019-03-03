/**
 * @file Owner DBPostCommand - Posts current guild count to discordbotlist
 * @module
 * @category owner
 * @name dbpost
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { ClientUser } from 'awesome-djs';
import fetch from 'node-fetch';
import { deleteCommandMessages, startTyping, stopTyping } from '../../components';

export default class DBPostCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'dbpost',
            group: 'owner',
            memberName: 'dbpost',
            description: 'Post current server count to Discord Bots List',
            guildOnly: false,
            ownerOnly: true,
        });
    }

    public async run (msg: CommandoMessage) {
        try {
            startTyping(msg);

            await fetch(`https://discordbots.org/api/bots/${(this.client.user as ClientUser).id}/stats`, {
                    body: JSON.stringify({ server_count: this.client.guilds.size }),
                    headers: { Authorization: (process.env.DISCORD_BOTS_API_KEY as string), 'Content-Type': 'application/json' },
                    method: 'POST',
                }
            );

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply('updated discordbots.org stats.');
        } catch (err) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply('an error occurred updating discordbots.org stats.');
        }
    }
}
