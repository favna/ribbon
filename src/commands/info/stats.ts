/**
 * @file Info RibbonStatsCommand - Statistics about Ribbon
 *
 * **Aliases**: `botinfo`, `info`
 * @module
 * @category info
 * @name stats
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { Message, MessageEmbed } from 'awesome-djs';
import { oneLine } from 'common-tags';
import moment from 'moment';
import 'moment-duration-format';

// tslint:disable-next-line:no-var-requires
const speedTest = require('speedtest-net');

export default class RibbonStatsCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'stats',
      aliases: ['botinfo', 'info'],
      group: 'info',
      memberName: 'stats',
      description: 'Gets statistics about Ribbon',
      examples: ['stats'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
    });
  }

  public async run (msg: CommandoMessage): Promise<any> {
    const speed = speedTest({
      maxTime: 5000,
      serverId: 3242,
    });
    const statsEmbed = new MessageEmbed();
    const fields = {
      info: {
        name: '\u200b',
        value: oneLine`
                    Use the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}
                    help\` command to get the list of commands available to you in a DM.
                    The default prefix is \`!\`. You can change this with the \`
                    ${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}
                    prefix\` command.
                    If you ever forget the command prefix, just use \`${this.client.user!.tag} prefix\``,
      },
      time: {
        name: 'Current server time',
        value: moment().format('MMMM Do YYYY [|] HH:mm.ss [UTC]ZZ'),
      },
    };

    statsEmbed
      .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
      .setAuthor(`${this.client.user!.username} Stats`, this.client.user!.displayAvatarURL({ format: 'png' }))
      .addField('Guilds', this.client.guilds.size, true)
      .addField('Channels', this.client.channels.size, true)
      .addField('Users', this.client.users.size, true)
      .addField('Owner', this.client.owners[0].tag, true)
      .addField('License', 'GPL-3.0', true)
      .addField('DiscordJS', 'master', true)
      .addField('NodeJS', process.version, true)
      .addField('Platform', this.fetchPlatform(process.platform.toLowerCase()), true)
      .addField('Memory Usage', `${roundNumber(process.memoryUsage().heapUsed / 10485.76) / 100} MB`, true)
      .addField('Invite Me', '[Click Here](https://favware.tech/redirect/ribbon)', true)
      .addField('Source', '[Available on GitHub](https://github.com/favna/ribbon)', true)
      .addField('Support', '[Server Invite](https://favware.tech/redirect/server)', true)
      .addField('Uptime', moment.duration(process.uptime() * 1000).format('D [days], H [hours] [and] m [minutes]'), true)
      .addField(fields.time.name, fields.time.value)
      .addField(fields.info.name, fields.info.value)
      .setFooter(`Ribbon | ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}`, this.client.user!.displayAvatarURL({ format: 'png' }));

    deleteCommandMessages(msg, this.client);

    const statMessage: Message = await msg.embed(statsEmbed) as Message;

    speed.on('data', (data: any) => {
      statsEmbed.fields.pop();
      statsEmbed.fields.pop();
      statsEmbed
        .addField('Download Speed', `${roundNumber(data.speeds.download, 2)} Mbps`, true)
        .addField('Upload Speed', `${roundNumber(data.speeds.upload, 2)} Mbps`, true)
        .addField(fields.time.name, fields.time.value)
        .addField(fields.info.name, fields.info.value);

      statMessage.edit('', statsEmbed);
    });
  }

  private fetchPlatform (plat: string) {
    switch (plat) {
      case 'win32':
        return 'Windows';
      case 'darwin':
        return 'MacOS';
      default:
        return 'Linux';
    }
  }
}
