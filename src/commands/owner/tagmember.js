/**
 * @file Owner TagMemberCommand - Tags a member by ID  
 * Primarily meant for mobile and when members have annoying untaggable names  
 * @module
 * @category owner
 * @name tagmember
 * @example tagmember ☜(⌒▽⌒)☞guy
 * @param {GuildMemberResolvable} AnyMember Member to make a mention to
 * @returns {Message} Mention of the member wrapped between carets
 */

const {Command} = require('discord.js-commando'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class TagMemberCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tagmember',
      memberName: 'tagmember',
      group: 'owner',
      description: 'Tag a member',
      format: 'MemberID|MemberName(partial or full)',
      examples: ['tagmember Favna'],
      guildOnly: false,
      ownerOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'What user would you like to snoop on?',
          type: 'member'
        }
      ]
    });
  }

  run (msg, {member}) {
    startTyping(msg);
    deleteCommandMessages(msg, this.client);
    msg.say(`^^^^ <@${member.id}> ^^^^`);

    return stopTyping(msg);
  }
};