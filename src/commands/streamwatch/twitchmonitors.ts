/**
 * @file Streamwatch TwitchMonitorsCommand - Configure which streamers to monitor
 *
 * **Aliases**: `monitors`, `monitor`, `twitchmonitor`
 * @module
 * @category streamwatch
 * @name twitchmonitors
 * @example twitchmonitors techagent favna
 * @param {string} AnyMembers List of members to monitor space delimited
 */

import { deleteCommandMessages, shouldHavePermission } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import { stripIndents } from 'common-tags';

type TwitchMonitorArgs = {
  members: GuildMember[];
};

export default class TwitchMonitorsCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'twitchmonitors',
      aliases: [ 'monitors', 'monitor', 'twitchmonitor' ],
      group: 'streamwatch',
      memberName: 'twitchmonitors',
      description: 'Configures which streamers to spy on',
      format: 'Member [Member Member Member]',
      examples: [ 'twitchmonitors Favna Techagent' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'members',
          prompt: 'Which members to monitor?',
          type: 'member',
          infinite: true,
        }
      ],
    });
  }

  @shouldHavePermission('ADMINISTRATOR')
  public async run(msg: CommandoMessage, { members }: TwitchMonitorArgs) {
    const memberIDs = members.map(m => m.id);
    const memberNames = members.map(m => m.displayName);

    msg.guild.settings.set('twitchmonitors', memberIDs);
    deleteCommandMessages(msg, this.client);

    return msg.reply(stripIndents`
      🕵 Started spying on the stream status of ${memberNames.map(val => `\`${val}\``).join(', ')}
      Use \`${msg.guild.commandPrefix}twitchtoggle\` to toggle twitch notifiers on or off
      Use \`${msg.guild.commandPrefix}twitchoutput\` to set the channel the notifiers should be sent to`);
  }
}