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
	{deleteCommandMessages} = require('../../util.js');

module.exports = class kaiCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'kiss',
			'memberName': 'kiss',
			'group': 'fun',
			'aliases': ['frenchkiss'],
			'description': 'Give someone a kiss ❤',
			'format': 'MemberToGiveAKiss',
			'examples': ['kiss Favna'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 3
			},
			'args': [
				{
					'key': 'member',
					'prompt': 'Who do you want to give a kiss?',
					'type': 'member',
					'default': ''
				}
			]
		});
	}

	fetchImage () {
		const images = [
				'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
				'https://media.giphy.com/media/ZRSGWtBJG4Tza/giphy.gif',
				'https://media.giphy.com/media/Gj8bn4pgTocog/giphy.gif',
				'https://media.giphy.com/media/JYpVJEcNrDAWc/giphy.gif',
				'https://media.giphy.com/media/KmeIYo9IGBoGY/giphy.gif',
				'https://media.tenor.com/images/e83afa35d71203bf60764cbbc17516db/tenor.gif',
				'http://25.media.tumblr.com/8ccc58d2c42dbef8ced3fc747518cffc/tumblr_mxgpinyLDk1t2wbmao1_400.gif',
				'https://media.tenor.com/images/ba45c5d09b59761797de1c55109a4844/tenor.gif',
				'https://i.imgur.com/eisk88U.gif',
				'https://media.giphy.com/media/8iwfa0XSxDUSQ/giphy.gif',
				'https://media.giphy.com/media/kU586ictpGb0Q/giphy.gif'
			],
			curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

		return images[curImage];
	}

	run (msg, args) {
		deleteCommandMessages(msg, this.client);
		msg.embed({
			'description': args.member !== ''
				? `${args.member.displayName}! You were kissed by ${msg.member.displayName} 💋!`
				: `${msg.member.displayName} you must feel alone... Have a 🐈`,
			'image': {'url': args.member !== '' ? this.fetchImage() : 'http://gifimage.net/wp-content/uploads/2017/06/anime-cat-gif-17.gif'},
			'color': msg.guild ? msg.guild.me.displayColor : 10610610
		});
	}
};