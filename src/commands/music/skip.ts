/**
 * @file Music SkipSongCommand - Skips the currently playing song and jumps to the next in queue or stops if it is the
 *     last song of the queue
 *
 * A vote to skip is started if there are 4 or more people in the voice channel with `(amount of members) / 3` as
 *     required amount of votes (bot doesn't count as a member). Staff that can delete messages can force the skip by
 *     using `skip force. You need to be in a voice channel before you can use this command.
 *
 * **Aliases**: `next`
 * @module
 * @category music
 * @name skip
 * @example skip
 * -OR-
 * skip force
 * @param {StringResolvable} [force] Force the skip if you are the requester or a server moderator
 */

import { oneLine } from 'common-tags';
import {
    Command,
    CommandoClient,
    CommandoGuild,
    CommandoMessage,
} from 'discord.js-commando';
import {
    deleteCommandMessages,
    IMusicCommand,
    IVote,
    roundNumber,
    startTyping,
    stopTyping,
} from '../../components';

export default class SkipSongCommand extends Command {
    public votes: Map<any, any>;
    private songQueue: any;

    constructor(client: CommandoClient) {
        super(client, {
            name: 'skip',
            aliases: ['next'],
            group: 'music',
            memberName: 'skip',
            description: 'Skips the song that is currently playing.',
            details:
                'If there are more than 3 people (not counting Ribbon) a voteskip is started. Staff can force the skip by adding `force` to the command',
            examples: ['skip'],
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
        });
        this.votes = new Map();
    }

    get queue() {
        if (!this.songQueue) {
            this.songQueue = (this.client.registry.resolveCommand(
                'music:play'
            ) as IMusicCommand).queue;
        }

        return this.songQueue;
    }

    public run(msg: CommandoMessage, args: any) {
        startTyping(msg);
        const queue = this.queue.get(msg.guild.id);

        if (!queue) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply("there isn't a song playing right now, silly.");
        }
        if (!queue.voiceChannel.members.has(msg.author.id)) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(
                "you're not in the voice channel. You better not be trying to mess with their mojo, man."
            );
        }
        if (!queue.songs[0].dispatcher) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(
                "the song hasn't even begun playing yet. Why not give it a chance?"
            );
        }

        const threshold = Math.ceil((queue.voiceChannel.members.size - 1) / 3);
        const force =
            threshold <= 1 ||
            queue.voiceChannel.members.size < threshold ||
            queue.songs[0].member.id === msg.author.id ||
            (msg.member.hasPermission('MANAGE_MESSAGES') &&
                args.toLowerCase() === 'force');

        if (force) {
            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.reply(this.skip(msg.guild, queue));
        }

        const vote = this.votes.get(msg.guild.id);

        if (vote && vote.count >= 1) {
            if (vote.users.some((userId: string) => userId === msg.author.id)) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.reply("you've already voted to skip the song.");
            }

            vote.count += 1;
            vote.users.push(msg.author.id);
            if (vote.count >= threshold) {
                deleteCommandMessages(msg, this.client);
                stopTyping(msg);

                return msg.reply(this.skip(msg.guild, queue));
            }

            const remaining = threshold - vote.count;
            const time = this.setTimeout(vote);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.say(oneLine`
				${vote.count} vote${vote.count > 1 ? 's' : ''} received so far,
				${remaining} more ${remaining > 1 ? 'are' : 'is'} needed to skip.
				Five more seconds on the clock! The vote will end in ${time} seconds.
			`);
        } else {
            const newVote: IVote = {
                count: 1,
                users: [msg.author.id],
                queue,
                guild: msg.guild.id,
                start: Date.now(),
                timeout: null,
            };
            const remaining = threshold - 1;
            const time = this.setTimeout(newVote);

            this.votes.set(msg.guild.id, newVote);

            deleteCommandMessages(msg, this.client);
            stopTyping(msg);

            return msg.say(oneLine`
                Starting a voteskip.
                ${remaining} more vote${
                remaining > 1 ? 's are' : ' is'
            } required for the song to be skipped.
                The vote will end in ${time} seconds.
            `);
        }
    }

    private skip(guild: CommandoGuild, queue: any) {
        if (this.votes.has(guild.id)) {
            clearTimeout(this.votes.get(guild.id).timeout);
            this.votes.delete(guild.id);
        }

        const song = queue.songs[0];

        song.dispatcher.end();

        return `Skipped: **${song}**`;
    }

    private setTimeout(vote: any) {
        const time = vote.start + 15000 - Date.now() + (vote.count - 1) * 5000;

        clearTimeout(vote.timeout);
        vote.timeout = setTimeout(() => {
            this.votes.delete(vote.guild);
            vote.queue.textChannel.send(
                'The vote to skip the current song has ended. Get outta here, party poopers.'
            );
        }, time);

        return roundNumber(time / 1000);
    }
}
