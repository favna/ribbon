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

const Discord = require('discord.js'),
	commando = require('discord.js-commando'),
	moment = require('moment'),
	path = require('path'),
	queue = require(path.join(__dirname, 'data.js')).queue,
	ytdl = require('ytdl-core');

module.exports = class playCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'play',
			'aliases': ['start'],
			'group': 'music',
			'memberName': 'play',
			'description': 'Add a song to your queue and start playing. Also auto-joins your voice channel',
			'examples': ['play {URL}', 'play https://www.youtube.com/watch?v=aatr_2MstrI'],
			'guildOnly': true,
			'throttling': {
				'usages': 1,
				'duration': 60
			},

			'args': [
				{
					'key': 'url',
					'prompt': 'YouTube Video to play?',
					'type': 'string',
					'label': 'URL to play',
					'validate': (url) => {
						if (/((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?/.test(url) || (/[a-zA-Z0-9_-]{11}/).test(url)) {
							return true;
						}

						return 'Your input has to be a URL';
					},
					'default': null
				}
			]
		});
	}

	run (msg, args) {
		console.log(args.url);
		console.log(args);

		if (!msg.guild.voiceConnection) {
			if (!msg.member.voiceChannel.joinable) {
				return msg.reply('I couldn\'t connect to your voice channel. If you are not yet in any voice channel please join one first.');
			}
			msg.member.voiceChannel.join()
				.then(connection => msg.say(`Jamming to my jukebox in ${msg.member.voiceChannel.name}`)); // eslint-disable-line no-unused-vars
		}

		if (args.url !== null) {
			console.log('in the add to queue if clause');
			ytdl.getInfo(args.url, (err, info) => { // eslint-disable-line consistent-return
				if (err) {
					return msg.reply(`Invalid Youtube Link: ${err}`);
				}
				if (!queue.hasOwnProperty(msg.guild.id)) {
					queue[msg.guild.id] = {};
					queue[msg.guild.id].playing = false;
					queue[msg.guild.id].songs = [];
				}
				console.log('just before adding to queue now');
				queue[msg.guild.id].songs.push({
					'url': args.url,
					'title': info.title,
					'requester': msg.member.displayName
				});

				const addEmbed = new Discord.MessageEmbed();

				addEmbed
					.setColor('#E24141')
					.setAuthor('Added to the queue', msg.author.displayAvatarURL())
					.setTitle(info.title)
					.setThumbnail(info.iurlhq720)
					.setURL(info.video_url)
					.addField('Channel', info.author.name, true)
					.addField('Song Duration', moment().startOf('day')
						.seconds(info.length_seconds)
						.format('HH:mm:ss'), true)
					.addField('Position in queue', queue[msg.guild.id].songs.length, true)
					.addField('Views', info.view_count, true)
					.addField('Published on', moment(info.published).format('MMMM Do YYYY [at] HH:mm'));
			});
		}

		if (!queue[msg.guild.id].songs) {
			return msg.say('You need to queue up some songs before I can play them');
		}

		if (queue[msg.guild.id].playing) {
			return msg.say('🎵 Already playing music 🎵');
		}
		const song = queue[msg.guild.id].songs[0];

		global.dispatcher = msg.guild.voiceConnection.playStream(ytdl(song.url, {'filter': 'audioonly'})); // eslint-disable-line sort-vars

		queue[msg.guild.id].playing = true;

		return msg.say(`Playing: \`${song.title}\` as requested by \`${song.requester}\``);
	}
};