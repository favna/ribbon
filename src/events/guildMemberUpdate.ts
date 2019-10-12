import { GuildMember } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
  async run(member: GuildMember) {
    this.updateStoredMember(member);
  }

  private updateStoredMember(member: GuildMember) {
    member.guild.memberSnowflakes.add(member.id);
    this.client.usertags.set(member.id, member.user.tag);
    if (member.guild.members.has(member.id)) member.guild.members.delete(member.id);
  }
}