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

const commando = require('discord.js-commando');

module.exports = class kaiCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'slap',
			'memberName': 'slap',
			'group': 'fun',
			'aliases': ['bakaslap'],
			'description': 'Give someone a slap 💢',
			'format': 'MemberToGiveASlap',
			'examples': ['slap Favna'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'member',
					'prompt': 'Who do you want to give a slap?',
					'type': 'member',
					'default': ''
				}
			]
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get(msg.guild, 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	fetchImage () {
		const images = [
				"https://media.giphy.com/media/jLeyZWgtwgr2U/giphy.gif",
				"https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif",
				"http://i.imgur.com/dzefPFL.gif",
				"https://media1.tenor.com/images/85722c3e51d390e11a0493696f32fb69/tenor.gif",
				"https://s-media-cache-ak0.pinimg.com/originals/65/57/f6/6557f684d6ffcd3cd4558f695c6d8956.gif",
				"https://media.giphy.com/media/LB1kIoSRFTC2Q/giphy.gif",
				"https://vignette.wikia.nocookie.net/adventuretimewithfinnandjake/images/c/cd/Slap.gif.gif",
				"https://gifimage.net/wp-content/uploads/2017/07/anime-slap-gif-14.gif",
				"http://gifimage.net/wp-content/uploads/2017/07/anime-slap-gif-9.gif",
				"https://gifimage.net/wp-content/uploads/2017/07/anime-slap-gif-15.gif",
				"http://rs1031.pbsrc.com/albums/y377/shinnidan/Toradora_-_Taiga_Slap.gif",
				"https://orig00.deviantart.net/2d34/f/2013/339/1/2/golden_time_flower_slap_gif_by_paranoxias-d6wv007.gif"
			],
			curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

		return images[curImage];
	}

	run (msg, args) {
		this.deleteCommandMessages(msg);
		msg.embed({
			'description': args.member !== '' ? `${args.member.displayName}! You have been given a Slap by ${msg.member.displayName} 💢!` : `${msg.member.displayName} did you mean to slap someone B-Baka 🤔?`,
			'image': {'url': args.member !== '' ? this.fetchImage() : 'http://cdn.awwni.me/mz98.gif'},
			'color': msg.guild ? msg.guild.members.get(this.client.user.id).displayColor : 16064544
		});
	}
};