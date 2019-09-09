import { GuildSettings } from '@settings/GuildSettings';
import RibbonEmbed from '@structures/RibbonEmbed';
import { ApplyOptions, logModMessage } from '@utils/Utils';
import { stripIndent, stripIndents } from 'common-tags';
import { Role } from 'discord.js';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'fr', 'automodfr', 'automodfilterroles' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Sets certain roles that should be exempt from automod features',
  extendedHelp: stripIndent`
    = Argument Details =
    roles :: The roles that should be filtered for automod features
  `,
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<roles:rolename> [...]',
})
export default class FilterRolesCommand extends Command {
  async run(msg: KlasaMessage, [ roles ]: [Role[]]) {
    msg.guildSettings.set(GuildSettings.automodFilterRoles, roles);
    const filterRolesEmbed = new RibbonEmbed(msg.author!)
      .setDescription(stripIndents(
        `
        **Action:** Automod filter roles have been ${roles.map(role => `\`${role.name}\``).join(', ')}
      `
      ));

    logModMessage(msg, filterRolesEmbed);

    return msg.sendEmbed(filterRolesEmbed);
  }
}