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
	eshop = require('nintendo-switch-eshop'),
	fs = require('fs'),
	{deleteCommandMessages} = require('../../util.js');

module.exports = class EshopFetchCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'eshopfetch',
			'memberName': 'eshopfetch',
			'group': 'search',
			'aliases': ['efetch'],
			'description': 'Fetches latest games list from the Nintendo Switch eShop',
			'examples': ['eshopfetch'],
			'guildOnly': false,
			'ownerOnly': true
		});
	}

	async run (msg) {
		fs.writeFileSync('../../data/websearch/eshop.json', JSON.stringify(await eshop.getGamesAmerica()), 'utf8');

		if (fs.existsSync('../../data/websearch/eshop.json')) {
			deleteCommandMessages(msg, this.client);

			return msg.reply('Latest eshop data stored in file');
		}

		return msg.reply('An error occured fetching latest data!');
	}
};