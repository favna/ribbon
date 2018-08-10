/**
 * @file Moderation SelfRolesCommand - Sets the self assignable roles for the server members, to be used by the `iam` command  
 * You can set multiple roles by delimiting with spaces (`role1 role2`)  
 * You can clear the setting by giving no roles then replying `finish`  
 * **Aliases**: `sroles`
 * @module
 * @category moderation
 * @name selfroles
 * @example selfroles uploader
 * @example selfroles uploader superuploader
 * @param {RoleResolvable} AnyRole Role to set, can be multiple split by spaces
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages, stopTyping, startTyping} = require('../../components/util.js');

module.exports = class SelfRolesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'selfroles',
      memberName: 'selfroles',
      group: 'moderation',
      aliases: ['sroles'],
      description: 'Sets the self assignable roles for the server members, to be used by the `iam` command',
      details: stripIndents`You can set multiple roles by delimiting with spaces (\`role1 role2\`)
                            You can clear the setting by giving no roles then replying \`finish\``,
      format: 'RoleID|RoleName(partial or full)',
      examples: ['selfroles uploader', 'selfroles uploader superuploader'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'roles',
          prompt: 'Which role would you like to set as the default role?',
          type: 'role',
          default: 'none',
          infinite: true
        }
      ],
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  run (msg, {roles, roleIDs = [], roleNames = []}) {
    startTyping(msg);
    const modlogChannel = msg.guild.settings.get('modlogchannel',
        msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
      selfRolesEmbed = new MessageEmbed();

    roles ? roles.forEach(role => roleIDs.push(role.id)) : null;
    roles ? roles.forEach(role => roleNames.push(role.name)) : null;

    let description = oneLine`self assignable roles have been set to ${roleNames.map(role => `\`${role}\``).join(', ')}`;

    if (!roles) {
      msg.guild.settings.remove('selfroles');
      description = 'self assignable roles have been removed, members who previously gave themselves a role will keep that role!';
    } else {
      msg.guild.settings.set('selfroles', roleIDs);
    }

    selfRolesEmbed
      .setColor('#AAEFE6')
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** ${description}`)
      .setTimestamp();

    if (msg.guild.settings.get('modlogs', true)) {
      if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
        msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
    				(or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
    				This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
        msg.guild.settings.set('hasSentModLogMessage', true);
      }
      modlogChannel ? msg.guild.channels.get(modlogChannel).send('', {embed: selfRolesEmbed}) : null;
    }

    deleteCommandMessages(msg, this.client);
    stopTyping(msg);

    return msg.embed(selfRolesEmbed);
  }
};