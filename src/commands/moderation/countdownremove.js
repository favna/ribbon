/**
 * @file Moderation CountDownRemove - Remove a specified countdown  
 * Use the countdownlist command to find the ID for deleting  
 * **Aliases**: `cdremove`, `countdowndelete`, `cddelete`, `cdd`, `cdr`
 * @module
 * @category moderation
 * @name countdownremove
 * @example countdownremove 1
 * @param {StringResolvable} CountdownID The ID of the Countdown to remove
 * @returns {MessageEmbed} Confirmation the countdown was removed
 */

import Database from 'better-sqlite3';
import moment from 'moment';
import momentduration from 'moment-duration-format'; // eslint-disable-line no-unused-vars
import path from 'path';
import {Command} from 'discord.js-commando';
import {MessageEmbed} from 'discord.js';
import {oneLine, stripIndents} from 'common-tags';
import {deleteCommandMessages, stopTyping, startTyping} from '../../components/util.js';

module.exports = class CountDownRemove extends Command {
  constructor (client) {
    super(client, {
      name: 'countdownremove',
      memberName: 'countdownremove',
      group: 'moderation',
      aliases: ['cdremove', 'countdowndelete', 'cddelete', 'cdd', 'cdr'],
      description: 'Remove a specified countdown',
      details: 'Use the countdownlist command to find the ID for deleting',
      format: 'CountdownID',
      examples: ['countdownremove 1'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'id',
          prompt: 'Which countdowns should I delete?',
          type: 'integer',
          validate: (v, msg) => {
            const conn = new Database(path.join(__dirname, '../../data/databases/countdowns.sqlite3')),
              rows = conn.prepare(`SELECT id FROM "${msg.guild.id}";`).all();

            if (rows.some(el => el.id === parseInt(v, 10))) {
              return true;
            } 
            
            return `that is not an ID of a countdown stored for this guild. You can view all the stored countdowns with the \`${msg.guild.commandPrefix}countdownlist\` command`;
              
          }
        }
      ],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  run (msg, {id}) {
    try {
      startTyping(msg);

      const conn = new Database(path.join(__dirname, '../../data/databases/countdowns.sqlite3')),
        modlogChannel = msg.guild.settings.get('modlogchannel',
          msg.guild.channels.find(c => c.name === 'mod-logs') ? msg.guild.channels.find(c => c.name === 'mod-logs').id : null),
        cdrEmbed = new MessageEmbed(),
        countdown = conn.prepare(`SELECT * from "${msg.guild.id}" WHERE id=$id`).get({id}); // eslint-disable-line one-var

      conn.prepare(`DELETE FROM "${msg.guild.id}" WHERE id=$id`).run({id});

      cdrEmbed
        .setColor('#F7F79D')
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(stripIndents`
          **Action:** Countdown removed
          **Event was at:** ${moment(countdown.datetime).format('YYYY-MM-DD HH:mm')}
          **Countdown Duration:** ${moment.duration(moment(countdown.datetime).diff(moment(), 'days'), 'days').format('w [weeks][, ] d [days] [and] h [hours]')}
          **Tag on event:** ${countdown.tag === 'none' ? 'No one' : `@${countdown.tag}`}
          **Channel:** <#${countdown.channel}>
          **Message:** ${countdown.content}`)
        .setTimestamp();

      if (msg.guild.settings.get('modlogs', true)) {
        if (!msg.guild.settings.get('hasSentModLogMessage', false)) {
          msg.reply(oneLine`📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
                                (or some other name configured by the ${msg.guild.commandPrefix}setmodlogs command) and give me access to it.
                                This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
          msg.guild.settings.set('hasSentModLogMessage', true);
        }
        modlogChannel && msg.guild.settings.get('modlogs', false) ? msg.guild.channels.get(modlogChannel).send('', {embed: cdrEmbed}) : null;
      }
        
      deleteCommandMessages(msg, this.client);
      stopTyping(msg);

      return msg.embed(cdrEmbed);
    } catch (err) {
      stopTyping(msg);
      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no countdowns found for this server. Start saving your first with ${msg.guild.commandPrefix}countdownadd`);
      }

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in validating the ID for the \`countdownremove\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};