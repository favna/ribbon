/**
 * @file Music StopMusicCommand - Stops the current queue. Bot will automatically leave the channel after this command
 *
 * A vote to skip is started if there are 4 or more people in the voice channel with `(amount of members) / 3` as
 *     required amount of votes (bot doesn't count as a member). Staff that can delete messages can force the skip by
 *     using `skip force`. You need to be in a voice channel before you can use this command.
 *
 * **Aliases**: `kill`, `stfu`, `quit`, `leave`, `disconnect`
 * @module
 * @category music
 * @name stop
 */

import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoGuild, CommandoMessage } from 'awesome-commando';
import { Snowflake } from 'awesome-djs';
import { oneLine } from 'common-tags';
import { MusicCommand, MusicQueueType, MusicVoteType } from 'RibbonTypes';

export default class StopMusicCommand extends Command {
  private songVotes: Map<Snowflake, MusicVoteType>;
  private songQueue: Map<Snowflake, MusicQueueType>;

  public constructor(client: CommandoClient) {
    super(client, {
      name: 'stop',
      aliases: [ 'kill', 'stfu', 'quit', 'leave', 'disconnect' ],
      group: 'music',
      memberName: 'stop',
      description: 'Stops the music and wipes the queue.',
      details: oneLine`
                If there are more than 3 people (not counting Ribbon) a votestop is started.
                Staff can force the stop by adding \`force\` to the command
              `,
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
    this.songVotes = this.votes;
    this.songQueue = this.queue;
  }

  private get queue() {
    if (!this.songQueue) {
      this.songQueue = (this.client.registry.resolveCommand('music:launch') as MusicCommand).queue;
    }

    return this.songQueue;
  }

  private get votes() {
    if (!this.songVotes) {
      this.songVotes = (this.client.registry.resolveCommand('music:launch') as MusicCommand).votes;
    }

    return this.songVotes;
  }

  public async run(msg: CommandoMessage, args: string) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) return msg.reply('there isn\'t any music playing right now.');
    if (!queue.voiceChannel.members.has(msg.author.id)) {
      return msg.reply('you\'re not in the voice channel. They really don\'t want you to mess up their vibe man.');
    }
    if (!queue.songs[0].dispatcher) return msg.reply('the song hasn\'t even begun playing yet. Why not give it a chance?');

    const threshold = Math.ceil((queue.voiceChannel.members.size - 1) / 3);
    const force =
      threshold <= 1 ||
      queue.voiceChannel.members.size < threshold ||
      queue.songs[0].member.id === msg.author.id ||
      (msg.member.hasPermission('MANAGE_MESSAGES') && args.toLowerCase() === 'force');

    if (force) {
      deleteCommandMessages(msg, this.client);

      queue.isTriggeredByStop = true;
      this.queue.set(msg.guild.id, queue);

      return msg.reply(this.stop(msg.guild, queue));
    }

    const vote = this.songVotes.get(msg.guild.id);

    if (vote && vote.count >= 1) {
      if (vote.users.some((userId: string) => userId === msg.author.id)) {
        deleteCommandMessages(msg, this.client);

        return msg.reply('you\'ve already voted to stop the music.');
      }

      vote.count += 1;
      vote.users.push(msg.author.id);
      if (vote.count >= threshold) {
        deleteCommandMessages(msg, this.client);

        return msg.reply(this.stop(msg.guild, queue));
      }

      const remaining = threshold - vote.count;
      const time = this.setTimeout(vote);

      deleteCommandMessages(msg, this.client);

      return msg.say(oneLine`
        ${vote.count} vote${vote.count > 1 ? 's' : ''} received so far,
        ${remaining} more ${remaining > 1 ? 'are' : 'is'} needed to stop.
        Five more seconds on the clock! The vote will end in ${time} seconds.`);
    }

    const newVote: MusicVoteType = {
      count: 1,
      users: [ msg.author.id ],
      queue,
      guild: msg.guild.id,
      start: Date.now(),
      timeout: null,
    };
    const newVotesRemaining = threshold - 1;
    const newTimeRemaining = this.setTimeout(newVote);

    this.songVotes.set(msg.guild.id, newVote);

    deleteCommandMessages(msg, this.client);

    return msg.say(oneLine`
      Starting a votestop.
      ${newVotesRemaining} more vote${newVotesRemaining > 1 ? 's are' : ' is'}
      required for the music to be stopped.
      The vote will end in ${newTimeRemaining} seconds.`);
  }

  private setTimeout(vote: MusicVoteType) {
    const time = vote.start + 15000 - Date.now() + ((vote.count - 1) * 5000);

    clearTimeout(vote.timeout);
    vote.timeout = setTimeout(() => {
      this.songVotes.delete(vote.guild);
      vote.queue.textChannel.send('The vote to stop the music has ended. Get outta here, party poopers.');
    }, time);

    return roundNumber(time / 1000);
  }

  private stop(guild: CommandoGuild, queue: MusicQueueType) {
    if (this.songVotes.has(guild.id)) {
      clearTimeout(this.songVotes.get(guild.id)!.timeout);
      this.songVotes.delete(guild.id);
    }

    const song = queue.songs[0];

    queue.songs = [];
    if (song.dispatcher) {
      song.dispatcher.end();
    }

    return 'you\'ve just killed the party. Congrats 🎉';
  }
}