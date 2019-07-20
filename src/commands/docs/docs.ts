/**
 * @file Docs DjsDocsCommand - Get an entry from the Discord.JS documentation
 *
 * **Aliases**: `djsguide`, `guide`, `djs`
 * @module
 * @category docs
 * @name docs
 * @example docs ClientUser
 * @param {string} DocEntry The entry from the docs you want to get info about
 * @param {string} [version] The Doc version to pick, one of `stable`, `master` or `commando`
 */

import { deleteCommandMessages } from '@components/Utils';
import { stringify } from '@favware/querystring';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { TextChannel } from 'awesome-djs';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import fetch from 'node-fetch';

type DjsDocsArgs = {
  query: string;
  version: 'stable' | 'master' | 'commando' | 'rpc' | 'main';
};

export default class DjsDocsCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'docs',
      aliases: [ 'djsguide', 'guide', 'djs' ],
      group: 'docs',
      memberName: 'docs',
      description: 'Gets info from something in the DJS docs',
      format: 'TopicToFind [master|stable|commando]',
      examples: [ 'docs ClientUser' ],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'query',
          prompt: 'what would you like to find in the Discord.JS documentation?',
          type: 'string',
          parse: (query: string) => query.toLowerCase().replace(/\.([A-z]+)\(\)/g, '#$1').replace(/\(\)/g, '').replace(/\./g, '#'),
        },
        {
          key: 'version',
          prompt: 'which version of docs would you like (stable, master, commando)?',
          type: 'string',
          oneOf: [ 'stable', 'master', 'commando', 'rpc' ],
          default: 'stable',
          parse: (value: string) => value.toLowerCase(),
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { query, version }: DjsDocsArgs) {
    try {
      let project: DjsDocsArgs['version'] = 'main';
      let branch = version;

      if ([ 'rpc', 'commando' ].includes(branch)) {
        project = branch;
        branch = 'master';
      }

      const res = await fetch(`https://djsdocs.sorta.moe/${project}/${branch}/embed?${stringify({ q: query})}`);
      const data = await res.json();

      if (!data) throw new Error('no_data_found');

      deleteCommandMessages(msg, this.client);

      return msg.embed(data);
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      if (/(?:no_data_found)/i.test(err.toString())) {
        return msg.reply(oneLine`
          I couldn't find any data for \`${query}\` in the Discord.JS/${version} docs.
          Maybe try searching something that actually exists next time?`);
      }

      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`docs\` command!
        **Server:** ${msg.guild.name} (${msg.guild.id})
        **Author:** ${msg.author.tag} (${msg.author.id})
        **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
        **Error Message:** ${err}`);

      return msg.reply(oneLine`
        an unknown and unhandled error occurred but I notified ${this.client.owners[0].username}.
        Want to know more about the error?
        Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command`);
    }
  }
}