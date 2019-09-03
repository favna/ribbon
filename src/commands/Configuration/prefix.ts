import { ApplyOptions, logModMessage } from '@components/Utils';
import RibbonEmbed from '@root/components/RibbonEmbed';
import { GuildSettings } from '@root/RibbonTypes';
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

    const prefixEmbed = new RibbonEmbed(msg.author!)
      .setDescription(`The prefix for this guild has been set to \`${prefix}\``);

    logModMessage(msg, prefixEmbed);

    return msg.sendEmbed(prefixEmbed);
  }

  async reset(msg: KlasaMessage) {
    await msg.guildSettings.reset(GuildSettings.prefix);

    return msg.send(`Switched back the guild's prefix back to \`${this.client.options.prefix}\`!`);
  }
}