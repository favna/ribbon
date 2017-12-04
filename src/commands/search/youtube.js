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

/* eslint-disable no-mixed-requires */

const Discord = require('discord.js'),
	YouTube = require('youtube-node'),
	auth = require('../../auth.json'),
	commando = require('discord.js-commando'),
	moment = require('moment'),
	youtube = new YouTube();

youtube.setKey(auth.googleapikey);
youtube.addParam('type', 'video');
youtube.addParam('relevanceLanguage', 'en');
youtube.addParam('safeSearch', 'moderate');
youtube.addParam('regionCode', 'NL');

module.exports = class youtubeCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'youtube',
			'group': 'search',
			'aliases': ['yt', 'tube'],
			'memberName': 'youtube',
			'description': 'Find videos on youtube',
			'examples': ['youtube {videoName}', 'youtube RWBY Volume 4'],
			'guildOnly': false,
			'throttling': {
				'usages': 1,
				'duration': 60
			},
			
			'args': [
				{
					'key': 'query',
					'prompt': 'What kind of video do you want to find?',
					'type': 'string',
					'label': 'Video to find'
				}
			]
		});
	}

	run (msg, args) {

		youtube.search(args.query, 1, (error, result) => {
			if (error) {
				console.error(error); // eslint-disable-line no-console

				return msg.reply('⚠️ No results found');
			} else if (!result || !result.items || result.items.length < 1) {
				msg.say('No Results found');

				return msg.delete(1000);
			}

			const youtubeEmbed = new Discord.MessageEmbed();

			youtubeEmbed
				.setAuthor(`Youtube Search Result for: ${args.query}`, 'https://i.imgur.com/BPFqnxz.png')
				.setImage(result.items[0].snippet.thumbnails.high.url)
				.setURL(`https://www.youtube.com/watch?v=${result.items[0].id.videoId}`)
				.setColor('#E24141')
				.addField('Title', result.items[0].snippet.title, true)
				.addField('URL', `[Click Here](https://www.youtube.com/watch?v=${result.items[0].id.videoId})`, true)
				.addField('Channel', `[${result.items[0].snippet.channelTitle}](https://www.youtube.com/channel/${result.items[0].snippet.channelId})`, true)
				.addField('Published Date', moment(result.items[0].snippet.publishedAt).format('MMMM Do YYYY'), true);
			result.items[0].snippet.description !== ''
				? youtubeEmbed.addField('Description', result.items[0].snippet.description, false)
				: youtubeEmbed.addField('Description', 'No description', false);

			return msg.embed(youtubeEmbed, `https://www.youtube.com/watch?v=${result.items[0].id.videoId}`);
		});
	}
};