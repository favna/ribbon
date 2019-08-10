/**
 * @file Extra CopypastaRemoveCommand - Remove a specified copypasta
 *
 * Use the copypastalist command to find the ID for deleting
 *
 * **Aliases**: `cpremove`, `copypastadelete`, `cpdelete`, `cpd`, `cpr`, `pastadelete`, `pasteremove`, `tagdelete`, `tagremove`
 * @module
 * @category extra
 * @name copypastaremove
 * @example copypastaremove 1
 * @param {string} CopyPastaID The ID of the Copypasta to remove
 */

import { deleteCommandMessages, logModMessage, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readAllPastas, readPasta, deletePasta } from '@components/Typeorm/DbInteractions';

type CopypastaRemoveArgs = {
  name: string;
};

export default class CopypastaRemoveCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'copypastaremove',
      aliases: [ 'cpremove', 'copypastadelete', 'cpdelete', 'cpd', 'cpr', 'pastadelete', 'pasteremove', 'tagremove', 'tagdelete' ],
      group: 'moderation',
      memberName: 'copypastaremove',
      description: 'Remove a specified copypasta',
      format: 'CopyPastaID',
      details: 'Use the copypastalist command to find the ID for deleting',
      examples: [ 'copypastaremove 1' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'name',
          prompt: 'Which Copypasta should I delete?',
          type: 'text',
          validate: async (value: string, msg: CommandoMessage) => {
            try {
              const pastas = await readAllPastas(msg.guild.id);
              if (pastas.some(row => row.name === value)) return true;

              return `that is not a name of a Copypasta stored for this guild. You can view all the stored pastas with the \`${msg.guild.commandPrefix}copypastalist\` command`;
            } catch (err) {
              return msg.reply(`no pastas saved for this server. Start saving your first with \`${msg.guild.commandPrefix}copypastaadd <name> <content>\``);
            }
          },
        }
      ],
    });
  }

  @shouldHavePermission('MANAGE_MESSAGES')
  public async run(msg: CommandoMessage, { name }: CopypastaRemoveArgs) {
    try {
      const modlogChannel = msg.guild.settings.get('modlogchannel', null);
      const cprEmbed = new MessageEmbed();
      const pasta = await readPasta(name, msg.guild.id);
      const pastaContent = pasta && pasta.content ? pasta.content : '';

      await deletePasta(name, msg.guild.id);

      cprEmbed
        .setColor('#F7F79D')
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(stripIndents`
          **Action:** Copypasta removed
          **Name was:** ${name}
          **Content was:** ${pastaContent.length <= 1800 ? pastaContent : `${pastaContent.slice(0, 1800)}...`}`
        )
        .setTimestamp();

      if (msg.guild.settings.get('modlogs', true)) {
        logModMessage(
          msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, cprEmbed
        );
      }

      deleteCommandMessages(msg, this.client);

      return msg.embed(cprEmbed);
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in the \`copypastaremove\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Name:** ${name}
        **Error Message:** ${err}`
      );

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`
      );
    }
  }
}