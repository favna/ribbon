/**
 * @file Info AvatarCommand - Get the avatar from any member on this server
 *
 * **Aliases**: `ava`
 * @module
 * @category info
 * @name avatar
 * @example avatar Favna
 * @param {GuildMemberResolvable} MemberName Member to get the avatar from
 * @param {GuildMemberResolvable} [ImageSize] Optional: Size of the avatar to get. Defaults to 1024
 */

import { DEFAULT_EMBED_COLOR } from '@components/Constants';
import { deleteCommandMessages } from '@components/Utils';
import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { GuildMember, ImageSize, MessageEmbed } from 'awesome-djs';

type AvatarArgs = {
  member: GuildMember;
  size: ImageSize;
};

export default class AvatarCommand extends Command {
  public constructor(client: CommandoClient) {
    super(client, {
      name: 'avatar',
      aliases: [ 'ava' ],
      group: 'info',
      memberName: 'avatar',
      description: 'Gets the avatar from a user',
      format: 'MemberID|MemberName(partial or full) [ImageSize]',
      examples: [ 'avatar Favna 2048' ],
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      args: [
        {
          key: 'member',
          prompt: 'What user would you like to get the avatar from?',
          type: 'member',
          default: (msg: CommandoMessage) => msg.member,
        },
        {
          key: 'size',
          prompt: 'What size do you want the avatar to be? (Valid sizes: 128, 256, 512, 1024, 2048)',
          type: 'integer',
          oneOf: [ 16, 32, 64, 128, 256, 512, 1024, 2048 ],
          default: 2048,
        }
      ],
    });
  }

  public async run(msg: CommandoMessage, { member, size }: AvatarArgs) {
    const ava = member.user.displayAvatarURL({ size });
    const embed = new MessageEmbed();
    const ext = this.fetchExt(ava);

    embed
      .setColor(msg.guild ? msg.guild.me!.displayHexColor : DEFAULT_EMBED_COLOR)
      .setImage(ext.includes('gif') ? `${ava}&f=.gif` : ava)
      .setTitle(member.displayName)
      .setURL(ava)
      .setDescription(`[Direct Link](${ava})`);

    deleteCommandMessages(msg, this.client);

    return msg.embed(embed);
  }

  private fetchExt(str: string) {
    return str.substring(str.length - 14, str.length - 8);
  }
}