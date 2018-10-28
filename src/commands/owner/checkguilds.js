/**
 * @file Owner CheckGuildsCommand - Lists all guilds Ribbon is in  
 * @module
 * @category owner
 * @name checkguilds 
 * @returns {Message} Amount and list of guilds in code blocks
 */

import {Command} from 'discord.js-commando';
import {stripIndents} from 'common-tags';

module.exports = class CheckGuildsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'checkguilds',
      memberName: 'checkguilds',
      group: 'owner',
      description: 'Check the current guild count and their names',
      guildOnly: false,
      ownerOnly: true
    });
  }

  run (msg) {
    msg.say(stripIndents`\`\`\`The current guild count: ${this.client.guilds.size}
        
        Guild list:
        ${this.client.guilds.map(m => m.name).join('\n')}\`\`\``, {split: true});
  }
};