/**
 * @file Info InviteCommand - Gets the invite link for the bot
 *
 * **Aliases**: `inv`, `links`, `shill`
 * @module
 * @category info
 * @name invite
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed } from 'awesome-djs';
import { stripIndents } from 'common-tags';

export default class InviteCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'invite',
      aliases: [ 'inv', 'links', 'shill' ],
      group: 'info',
      memberName: 'invite',
      description: 'Gives you invitation links',
      examples: [ 'invite' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      guarded: true,
    });
  }

  public async run(msg: CommandoMessage) {
    const inviteEmbed = new MessageEmbed();

    inviteEmbed
      .setTitle('Ribbon by Favna')
      .setThumbnail(this.client.user!.displayAvatarURL({ format: 'png' }))
      .setURL('https://favware.tech/ribbon')
      .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
      .setDescription(stripIndents`
        Enrich your Discord server with a fully modular Discord bot with many many commands\n
        [Add me to your server](https://favware.tech/redirect/ribbon)
        [Join the Support Server](https://favware.tech/redirect/server)
        [Website](https://favware.tech/ribbon)
        [GitHub](https://github.com/Favna/Ribbon)
        [Wiki](https://github.com/Favna/Ribbon/wiki)`);

    deleteCommandMessages(msg, this.client);

    return msg.embed(inviteEmbed, 'Find information on Ribbon here: https://favware.tech/ribbon');
  }
}