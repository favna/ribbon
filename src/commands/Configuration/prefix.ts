import { ApplyOptions, logModMessage } from '@components/Utils';
import { GuildSettings } from '@root/RibbonTypes';
import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'setPrefix' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Change the command prefix the bot uses in your server.',
  permissionLevel: 6,
  guarded: true,
  runIn: [ 'text' ],
  usage: '[reset|prefix:str{1,10}]',
})
export default class PrefixCommand extends Command {
  // @clientHasPermission('BAN_MEMBERS')
  async run(msg: KlasaMessage, [ prefix ]: [string]) {
    // if (!hasPermission) {
    //   return msg.sendLocale('CLIENT_MISSING_PERMISSION', [ 'BAN_MEMBERS', this.name ]);
    // }
    if (!prefix) return msg.send(`The prefix for this guild is \`${msg.guildSettings.get(GuildSettings.prefix)}\``);
    if (prefix === 'reset') return this.reset(msg);
    if (msg.guildSettings.get(GuildSettings.prefix) === prefix) return msg.sendLocale('CONFIGURATION_EQUALS', [ prefix ]);
    await msg.guildSettings.update(GuildSettings.prefix, prefix);

    logModMessage(
      msg,
      new MessageEmbed()
        .setColor('#3DFFE5')
        .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
        .setDescription(stripIndents(
          `
            **Action:** Changed guild prefix
            **New prefix:** \`${prefix}\`
          `
        ))
        .setTimestamp()
    );

    return msg.send(`The prefix for this guild has been set to \`${prefix}\``);
  }

  async reset(msg: KlasaMessage) {
    await msg.guildSettings.reset(GuildSettings.prefix);

    return msg.send(`Switched back the guild's prefix back to \`${this.client.options.prefix}\`!`);
  }
}