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

module.exports = class addCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'add',
			'aliases': ['enqueue'],
			'group': 'music',
			'memberName': 'add',
			'description': 'Add a song to the play queue',
			'examples': ['add {URL}', 'add https://www.youtube.com/watch?v=aatr_2MstrI'],
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
						if (/((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?/.test(url)) {
							return true;
						}
						if (/[a-zA-Z0-9_-]{11}/.test(url)) {
							return true;
						}

						return 'Your input has to be a URL';
					}
				}
			]
		});
	}

	run (msg, args) {
		ytdl.getInfo(args.url, (err, info) => {
			if (err) {
				return msg.reply(`⚠️ Invalid Youtube Link: ${err}`);
			}
			if (!queue.hasOwnProperty(msg.guild.id)) {
				queue[msg.guild.id] = {};
				queue[msg.guild.id].playing = false;
				queue[msg.guild.id].songs = [];
			}
			queue[msg.guild.id].songs.push({
				'url': info.video_url,
				'title': info.title,
				'duration': moment().startOf('day')
					.seconds(info.length_seconds)
					.format('HH:mm:ss'),
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
					
			return msg.embed(addEmbed);
		
		});

	}
};