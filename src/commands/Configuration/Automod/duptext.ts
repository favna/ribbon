import { ApplyOptions, logModMessage } from '@root/components/Utils';
import { GuildSettings } from '@root/RibbonTypes';
import { stripIndents, oneLine } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandOptions, KlasaMessage } from 'klasa';

@ApplyOptions<CommandOptions>({
  aliases: [ 'duplicatefilter', 'duplicatetextfilter', 'dtf' ],
  cooldown: 3,
  cooldownLevel: 'guild',
  description: 'Toggle the bad words filter',
  extendedHelp: stripIndents`
    Please note that when adding new words to your server\'s filter you overwrite all your currently set words!

    = Argument Details =
    shouldEnable :: Whether the filter should be enabled or not
    within :: The amount of minutes during which should be checked for duplicate messages
    equals :: How many similar mesasges any user can send before getting them deleted
    distance :: The levenshtein distance of how similar messages can be
  `,
  permissionLevel: 2,
  runIn: [ 'text' ],
  usage: '<shouldEnable:boolean> [within:int{1,15}] [equals:int{1,15}] [distance:int{1,50}]',
  usageDelim: ' ',
})
export default class DuptextCommand extends Command {
  async run(msg: KlasaMessage, [ shouldEnable, within, equals, distance ]: [boolean, number, number, number]) {
    if (shouldEnable) {
      if (!within) within = 3;
      if (!equals) equals = 2;
      if (!distance) distance = 20;
    }

    msg.guildSettings.set(GuildSettings.autmodDuptext, {
      enabled: shouldEnable, within, equals, distance,
    });

    const dtfEmbed = new MessageEmbed()
      .setColor('#439DFF')
      .setAuthor(msg.author!.tag, msg.author!.displayAvatarURL())
      .setDescription(stripIndents(
        `
          **Action:** Duplicate text filter has been ${shouldEnable ? 'enabled' : 'disabled'}
          ${shouldEnable ? `**Timeout:** Duplicate text is checked between messages sent in the past ${within} minutes` : ''}
          ${shouldEnable ? `**Duplicates:** Members can send ${equals} duplicate messages before any others are deleted` : ''}
          ${shouldEnable ? `**Distance:** Messages are deleted if they have a levenshtein distance of at least ${distance}` : ''}
          ${msg.guildSettings.get(GuildSettings.automodEnabled) ? '' : oneLine`
              **Notice:** Be sure to enable the general automod toggle with the \`${msg.guildSettings.get(GuildSettings.prefix)}automod\` command!
            `}
        `
      ));

    logModMessage(msg, dtfEmbed);

    return msg.sendEmbed(dtfEmbed);
  }
}