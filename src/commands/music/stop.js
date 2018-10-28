/**
 * @file Music StopMusicCommand - Stops the current queue. Bot will automatically leave the channel after this command  
 * A vote to skip is started if there are 4 or more people in the voice channel with `(amount of members) / 3` as required amount of votes (bot doesn't count as a member)  
 * Staff that can delete messages can force the skip by using `skip force`  
 * You need to be in a voice channel before you can use this command  
 * **Aliases**: `kill`, `stfu`, `quit`, `leave`, `disconnect`
 * @module
 * @category music
 * @name stop
 * @returns {Message} Sad face about stopping the music
 */

import {Command} from 'discord.js-commando'; 
import {oneLine} from 'common-tags'; 
import {deleteCommandMessages, roundNumber, stopTyping, startTyping} from '../../components/util.js';

module.exports = class StopMusicCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'stop',
      memberName: 'stop',
      group: 'music',
      aliases: ['kill', 'stfu', 'quit', 'leave', 'disconnect'],
      description: 'Stops the music and wipes the queue.',
      details: 'If there are more than 3 people (not counting Ribbon) a votestop is started. Staff can force the stop by adding `force` to the command',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
    this.votes = new Map();
  }

  /* eslint-disable max-statements*/
  run (msg, args) {
    startTyping(msg);
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('there isn\'t any music playing right now.');
    }
    if (!queue.voiceChannel.members.has(msg.author.id)) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('you\'re not in the voice channel. They really don\'t want you to mess up their vibe man.');
    }
    if (!queue.songs[0].dispatcher) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply('the song hasn\'t even begun playing yet. Why not give it a chance?');
    }

    const threshold = Math.ceil((queue.voiceChannel.members.size - 1) / 3), // eslint-disable-line one-var
      force = threshold <= 1 ||
      queue.voiceChannel.members.size < threshold ||
      queue.songs[0].member.id === msg.author.id ||
      (msg.member.hasPermission('MANAGE_MESSAGES') && args.toLowerCase() === 'force'); // eslint-disable-line no-extra-parens

    if (force) {
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.reply(this.stop(msg.guild, queue));
    }

    const vote = this.votes.get(msg.guild.id); // eslint-disable-line one-var

    if (vote && vote.count >= 1) {
      if (vote.users.some(user => user === msg.author.id)) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply('you\'ve already voted to stop the music.');
      }

      vote.count += 1;
      vote.users.push(msg.author.id);
      if (vote.count >= threshold) {
        deleteCommandMessages(msg, this.client);
        stopTyping(msg);

        return msg.reply(this.stop(msg.guild, queue));
      }

      const remaining = threshold - vote.count,
        time = this.setTimeout(vote);

      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.say(oneLine`
				${vote.count} vote${vote.count > 1 ? 's' : ''} received so far,
				${remaining} more ${remaining > 1 ? 'are' : 'is'} needed to stop.
				Five more seconds on the clock! The vote will end in ${time} seconds.
			`);
    }
    const newVote = { // eslint-disable-line one-var            
        count: 1,
        users: [msg.author.id],
        queue,
        guild: msg.guild.id,
        start: Date.now(),
        timeout: null
      },
      remaining = threshold - 1,
      time = this.setTimeout(newVote);

    this.votes.set(msg.guild.id, newVote);

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.say(oneLine`
				Starting a votestop.
				${remaining} more vote${remaining > 1 ? 's are' : ' is'} required for the music to be stopped.
				The vote will end in ${time} seconds.
			`);
  }

  stop (guild, queue) {
    if (this.votes.has(guild.id)) {
      clearTimeout(this.votes.get(guild.id).timeout);
      this.votes.delete(guild.id);
    }

    const song = queue.songs[0]; // eslint-disable-line one-var

    queue.songs = [];
    if (song.dispatcher) {
      song.dispatcher.end();
    }

    return 'you\'ve just killed the party. Congrats 🎉';
  }

  setTimeout (vote) {
    const time = vote.start + 15000 - Date.now() + (vote.count - 1) * 5000;

    clearTimeout(vote.timeout);
    vote.timeout = setTimeout(() => {
      this.votes.delete(vote.guild);
      vote.queue.textChannel.send('The vote to stop the music has ended. Get outta here, party poopers.');
    }, time);

    return roundNumber(time / 1000);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('music:play').queue;
    }

    return this._queue;
  }
};