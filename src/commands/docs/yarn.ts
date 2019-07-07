/**
 * @file Docs YarnCommand - Responds with information on a NodeJS package using the Yarn package registry
 *
 * **Aliases**: `npm`, `npm-package`
 * @module
 * @category docs
 * @name yarn
 * @example yarn @favware/querystring
 * @param {string} pkg The package to find
 */

import { ASSET_BASE_PATH } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { MessageEmbed, TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';

type YarnArgs = {
  pkg: string;
};

export default class YarnCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'yarn',
      aliases: ['npm', 'npm-package'],
      group: 'docs',
      memberName: 'yarn',
      description: 'Responds with information on a NodeJS package using the Yarn package registry',
      format: 'package_name',
      examples: ['yarn @favware/querystring'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'pkg',
          prompt: 'What package would you like to search on the Yarn package Registry?',
          type: 'string',
          parse: (p: string) => encodeURIComponent(p.toLowerCase().replace(/ /g, '-')),
        }
      ],
    });
  }

  private static trimArray (arr: string[]) {
    if (arr.length > 10) {
      const len = arr.length - 10;
      arr = arr.slice(0, 10);
      arr.push(`${len} more...`);
    }

    return arr;
  }

  public async run (msg: CommandoMessage, { pkg }: YarnArgs) {
    try {
      const res = await fetch(`https://registry.yarnpkg.com/${pkg}`);

      if (res.status === 404) throw new Error('no_pkg_found');

      const body = await res.json();

      if (body.time.unpublished) throw new Error('unpublished_pkg');

      const version = body.versions[body['dist-tags'].latest];
      const maintainers = YarnCommand.trimArray(body.maintainers.map((user: { name: string, email: string }) => user.name));
      const dependencies = version.dependencies ? YarnCommand.trimArray(Object.keys(version.dependencies)) : null;
      const yarnEmbed = new MessageEmbed()
        .setColor('#2C8EBA')
        .setAuthor('Yarn', `${ASSET_BASE_PATH}/ribbon/yarn.png`, 'https://yarnpkg.com/')
        .setTitle(body.name)
        .setURL(`https://yarnpkg.com/en/package/${pkg}`)
        .setDescription(body.description || 'No description.')
        .addField('❯ Version', body['dist-tags'].latest, true)
        .addField('❯ License', body.license || 'None', true)
        .addField('❯ Author', body.author ? body.author.name : '???', true)
        .addField('❯ Creation Date', moment.utc(body.time.created).format('YYYY-MM-DD HH:mm'), true)
        .addField('❯ Modification Date', moment.utc(body.time.modified).format('YYYY-MM-DD HH:mm'), true)
        .addField('❯ Main File', version.main || 'index.js', true)
        .addField('❯ Dependencies', dependencies && dependencies.length ? dependencies.join(', ') : 'None')
        .addField('❯ Maintainers', maintainers.join(', '));

      deleteCommandMessages(msg, this.client);
      return msg.embed(yarnEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      if (/(?:no_pkg_found)/i.test(err.toString())) {
        return msg.reply(oneLine`
          I couldn't find any package by the name of \`${pkg}\` In the Yarnpkg registry.
          Maybe try searching something that actually exists next time?`
        );
      }

      if (/(?:unpublished_pkg)/i.test(err.toString())) {
        return msg.reply(`What a silly developer who made ${pkg}! They unpublished their package!`);
      }

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`yarn\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author!.tag} (${msg.author!.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
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
