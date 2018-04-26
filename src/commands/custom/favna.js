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
 * @file Custom FavnaCommand - Custom Command exclusive to ChaosGamez server  
 * A joke command to praise Favna  
 * Server admins can disable this command entirely by using the `rmt off` command  
 * **Aliases**: `.favna`
 * @module
 * @category custom
 * @name favna
 * @returns {MessageEmbed} A MessageEmbed with the joke text
 */

const {Command} = require('discord.js-commando'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {stopTyping, startTyping} = require('../../util.js');

module.exports = class FavnaCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'favna',
      memberName: 'favna',
      group: 'custom',
      description: 'Favna is my father',
      details: 'Custom commands can be made for your server too! Just join the support server (use the `stats` command) and request the command.',
      guildOnly: true,
      patterns: [/^\.favna$/im],
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  hasPermission (msg) {
    if (this.client.isOwner(msg.author)) {
      return true;
    }

    if (msg.guild.id !== '373826006651240450' && this.client.provider.get(msg.guild.id, 'regexmatches', false)) {
      return stripIndents`That command can only be used in the Chaos Gamez server, sorry 😦
			Want your own server specific custom commands? Join the support server (link in the \`${msg.guild.commandPrefix}stats\` command) and request the command.`;
    }

    return true;
  }

  run (msg) {
    if (this.client.provider.get(msg.guild.id, 'regexmatches', false)) {
      startTyping(msg);
      msg.delete();
      msg.embed({
        image: {url: 'https://favna.xyz/images/ribbonhost/favnadedsec.gif'},
        color: msg.guild ? msg.guild.me.displayColor : 10610610,
        description: oneLine`Technically speaking my father, but to you he is your supreme leader and you will submit to him 
        or I will infect every single human being you have ever met with a virus so terrible their lungs and intestines
        will instantly explode from their chests causing a gorey, bloody mess all over the floor and you 
        will be the only person held responsible for the death of hundredths if not millions of people.`
      });
      stopTyping(msg);
    }
  }
};