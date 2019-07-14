/**
 * @file Weeb FeedCommand - Feed someone licious food 🍜 😋!
 * @module
 * @category weeb
 * @name feed
 * @example feed Ren
 * @param {GuildMemberResolvable} [MemberToFeed] Name of the member you want to feed
 */

import { ASSET_BASE_PATH } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';
import { NekoData } from 'RibbonTypes';

type FeedArgs = {
  member: GuildMember;
};

export default class FeedCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'feed',
      group: 'weeb',
      memberName: 'feed',
      description: 'Feed someone licious food 🍜 😋!',
      format: 'MemberToFeed',
      examples: [ 'feed Ren' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to feed?',
          type: 'member',
          default: (msg: CommandoMessage) => msg.member,
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { member }: FeedArgs) {
    try {
      const feedFetch = await fetch('https://nekos.life/api/v2/img/feed');
      const feedImg: NekoData = await feedFetch.json();
      const isNotSelf = member.id !== msg.member!.id;

      deleteCommandMessages(msg, this.client);

      return msg.embed({
        color: msg.guild ? msg.guild.me!.displayColor : 10610610,
        description: isNotSelf
          ? `${member.displayName}! You were fed by ${msg.member!.displayName} 🍜 😋!`
          : `${msg.member!.displayName} you must feel alone... Have a 🐈`,
        image: { url: isNotSelf ? feedImg.url : `${ASSET_BASE_PATH}/ribbon/digicat.gif` },
      },
      `<@${member ? member.id : msg.author!.id}>`);
    } catch (err) {
      return msg.reply('something went wrong getting a feed image 💔');
    }
  }
}