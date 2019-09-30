/**
 * @file Casino LeaderboardCommand - Shows the top 5 ranking players for your server
 *
 * **Aliases**: `lb`, `casinolb`, `leaderboards`
 * @module
 * @category casino
 * @name leaderboard
 */

import { ASSET_BASE_PATH, DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages, roundNumber } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { oneLine, stripIndents } from 'common-tags';
import moment from 'moment';
import { readCasinoLimited } from '@components/Typeorm/DbInteractions';

interface LeaderboardArgs {
  limit: number;
}

export default class LeaderboardCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'leaderboard',
      aliases: [ 'lb', 'casinolb', 'leaderboards' ],
      group: 'casino',
      memberName: 'leaderboard',
      description: 'Shows the top 5 ranking players for your server',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'limit',
          prompt: 'How many players should I show?',
          type: 'integer',
          max: 20,
          min: 1,
          default: 5,
          parse: (limit: string) => roundNumber(Number(limit)),
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { limit }: LeaderboardArgs) {
    const lbEmbed = new MessageEmbed()
      .setTitle(`Top ${limit} players`)
      .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
      .setThumbnail(`${ASSET_BASE_PATH}/ribbon/casinologo.png`);

    try {
      const casino = await readCasinoLimited(msg.guild.id, limit);

      if (casino) {
        casino.forEach((row, index) => {
          if (row.userId) {
            lbEmbed.addField(`#${index + 1} ${(msg.guild.members.get(row.userId) as GuildMember).displayName}`,
              `Chips: ${row.balance}`);
          }
        });

        deleteCommandMessages(msg, this.client);

        return msg.embed(lbEmbed);
      }

      return msg.reply(oneLine`
        looks like there aren't any casino players in this server yet,
        use the \`${msg.guild.commandPrefix}chips\` command to get your first 500`
      );
    } catch (err) {
      const channel = this.client.channels.get(process.env.ISSUE_LOG_CHANNEL_ID!) as TextChannel;

      channel.send(stripIndents`
        <@${this.client.owners[0].id}> Error occurred in \`leaderboard\` command!
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