/*
 *   This file is part of Ribbon
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

const commando = require('discord.js-commando'),
	{oneLine} = require('common-tags');

module.exports = class SkipSongCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'skip',
			'group': 'music',
			'memberName': 'skip',
			'description': 'Skips the song that is currently playing.',
			'examples': ['skip'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			}
		});
		this.votes = new Map();
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	run (msg, args) {
		const queue = this.queue.get(msg.guild.id);

		if (!queue) {
			this.deleteCommandMessages(msg);
			
			return msg.reply('there isn\'t a song playing right now, silly.');
		}
		if (!queue.voiceChannel.members.has(msg.author.id)) {
			this.deleteCommandMessages(msg);
			
			return msg.reply('you\'re not in the voice channel. You better not be trying to mess with their mojo, man.');
		}
		if (!queue.songs[0].dispatcher) {
			this.deleteCommandMessages(msg);
			
			return msg.reply('the song hasn\'t even begun playing yet. Why not give it a chance?');
		} // eslint-disable-line max-len

		const threshold = Math.ceil((queue.voiceChannel.members.size - 1) / 3), // eslint-disable-line one-var
			force = threshold <= 1 || // eslint-disable-line sort-vars
			queue.voiceChannel.members.size < threshold ||
			(msg.member.hasPermission('MANAGE_MESSAGES') && args.toLowerCase() === 'force'); // eslint-disable-line no-extra-parens

		if (force) {
			this.deleteCommandMessages(msg);
			
			return msg.reply(this.skip(msg.guild, queue));
		}

		const vote = this.votes.get(msg.guild.id); // eslint-disable-line one-var

		if (vote && vote.count >= 1) {
			if (vote.users.some(user => user === msg.author.id)) {
				this.deleteCommandMessages(msg);
				
				return msg.reply('you\'ve already voted to skip the song.');
			}

			vote.count += 1;
			vote.users.push(msg.author.id);
			if (vote.count >= threshold) {
				this.deleteCommandMessages(msg);
				
				return msg.reply(this.skip(msg.guild, queue));
			}

			const remaining = threshold - vote.count,
				time = this.setTimeout(vote);

			this.deleteCommandMessages(msg);
			
			return msg.say(oneLine `
				${vote.count} vote${vote.count > 1 ? 's' : ''} received so far,
				${remaining} more ${remaining > 1 ? 'are' : 'is'} needed to skip.
				Five more seconds on the clock! The vote will end in ${time} seconds.
			`);
		}
		const newVote = { // eslint-disable-line one-var            
				'count': 1,
				'users': [msg.author.id],
				queue,
				'guild': msg.guild.id,
				'start': Date.now(),
				'timeout': null
			},
			remaining = threshold - 1,
			time = this.setTimeout(newVote);

		this.votes.set(msg.guild.id, newVote);

		this.deleteCommandMessages(msg);
		
		return msg.say(oneLine `
				Starting a voteskip.
				${remaining} more vote${remaining > 1 ? 's are' : ' is'} required for the song to be skipped.
				The vote will end in ${time} seconds.
			`);

	}

	skip (guild, queue) {
		if (this.votes.has(guild.id)) {
			clearTimeout(this.votes.get(guild.id).timeout);
			this.votes.delete(guild.id);
		}

		const song = queue.songs[0];

		song.dispatcher.end();

		return `Skipped: **${song}**`;
	}

	setTimeout (vote) {
		const time = vote.start + 15000 - Date.now() + (vote.count - 1) * 5000; // eslint-disable-line

		clearTimeout(vote.timeout);
		vote.timeout = setTimeout(() => {
			this.votes.delete(vote.guild);
			vote.queue.textChannel.send('The vote to skip the current song has ended. Get outta here, party poopers.');
		}, time);

		return Math.round(time / 1000);
	}

	get queue () {

		/* eslint-disable no-underscore-dangle */
		if (!this._queue) {
			this._queue = this.client.registry.resolveCommand('music:play').queue;
		}

		return this._queue;
		/* eslint-enable no-underscore-dangle */
	}
};