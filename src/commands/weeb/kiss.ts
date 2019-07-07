/**
 * @file Weeb KissCommand - Give someone a kiss ❤!
 * @module
 * @category weeb
 * @name kiss
 * @example kiss Pyrrha
 * @param {GuildMemberResolvable} [MemberToKiss] Name of the member you want to give a kiss
 */

import { ASSET_BASE_PATH } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember } from 'awesome-djs';
import fetch from 'node-fetch';

type KissArgs = {
  member: GuildMember;
};

export default class KissCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'kiss',
      group: 'weeb',
      memberName: 'kiss',
      description: 'Give someone a kiss ❤',
      format: 'MemberToGiveAKiss',
      examples: ['kiss Pyrrha'],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'Who do you want to give a kiss?',
          type: 'member',
          default: (msg: CommandoMessage) => msg.member,
        }
      ],
    });
  }

  public async run (msg: CommandoMessage, { member }: KissArgs) {
    try {
      const kissFetch = await fetch('https://nekos.life/api/v2/img/kiss');
      const kissImg = await kissFetch.json();
      const isNotSelf = member.id !== msg.member!.id;

      deleteCommandMessages(msg, this.client);

      return msg.embed({
          color: msg.guild ? msg.guild.me!.displayColor : 10610610,
          description: isNotSelf
            ? `${member.displayName}! You were kissed by ${msg.member!.displayName} 💋!`
            : `${msg.member!.displayName} you must feel alone... Have a 🐈`,
          image: { url: isNotSelf ? kissImg.url : `${ASSET_BASE_PATH}/ribbon/digicat.gif` },
        },
        `<@${member ? member.id : msg.author!.id}>`
      );
    } catch (err) {
      return msg.reply('something went wrong getting a kiss image 💔');
    }
  }
}
