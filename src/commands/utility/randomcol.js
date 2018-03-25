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

/**
 * Generates a random color  
 * **Aliases**: `randhex`, `rhex`, `randomcolor`, `randcol`, `randomhex`
 * @module
 * @category utility
 * @name randomcol
 * @returns {MessageEmbed} Color of embed matches generated color
 */

const {MessageEmbed} = require('discord.js'),
	commando = require('discord.js-commando'), 
	{stripIndents} = require('common-tags'), 
	{deleteCommandMessages} = require('../../util.js');

module.exports = class RandomColCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'randomcol',
			'memberName': 'randomcol',
			'group': 'utility',
			'aliases': ['randhex', 'rhex', 'randomcolor', 'randcol', 'randomhex'],
			'description': 'Generate a random color',
			'examples': ['randomcol'],
			'guildOnly': false,
			'throttling': {
				'usages': 2,
				'duration': 3
			}
		});
	}

	hextodec (color) {
		return parseInt(color.replace('#', ''), 16);
	}

	hextorgb (color) {
		const result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d])*$/i).exec(color);

		return {
			'r': parseInt(result[1], 16),
			'g': parseInt(result[2], 16),
			'b': parseInt(result[3], 16)
		};
	}

	run (msg) {
		const embed = new MessageEmbed(),
			hex = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

		embed
			.setColor(hex)
			.setDescription(stripIndents `**hex**: ${hex}
			**dec**: ${this.hextodec(hex)}
			**rgb**: rgb(${this.hextorgb(hex).r}, ${this.hextorgb(hex).g}, ${this.hextorgb(hex).b})`);

		deleteCommandMessages(msg, this.client);

		msg.embed(embed);
	}
};