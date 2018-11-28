/**
 * @file Custom KaiCommand - Custom Command exclusive to ChaosGamez server  
 * A joke command to spite Kai  
 * Server admins can disable this command entirely by using the `rmt off` command  
 * **Aliases**: `.kai`
 * @module
 * @category custom
 * @name kai
 */

import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { startTyping, stopTyping } from '../../components/util';

export default class KaiCommand extends Command {
  constructor (client: CommandoClient) {
    super(client, {
      name: 'kai',
      group: 'custom',
      memberName: 'kai',
      description: 'Kai get lost',
      details: 'Custom commands can be made for your server too! Just join the support server (use the `stats` command) and request the command.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3,
      },
      patterns: [ /^\.kai$/im ],
    });
  }

  public fetchImage () {
    const images = [
        'https://favna.xyz/images/ribbonhost/kai/antikai01.png',
        'https://favna.xyz/images/ribbonhost/kai/antikai02.png',
        'https://favna.xyz/images/ribbonhost/kai/antikai03.png',
        'https://favna.xyz/images/ribbonhost/kai/antikai04.png',
        'https://favna.xyz/images/ribbonhost/kai/antikai05.png',
        'https://favna.xyz/images/ribbonhost/kai/antikai06.gif',
        'https://favna.xyz/images/ribbonhost/kai/antikai07.png',
        'https://favna.xyz/images/ribbonhost/kai/antikai08.png',
        'https://favna.xyz/images/ribbonhost/kai/antikai09.png',
        'https://favna.xyz/images/ribbonhost/kai/antikai10.png'
      ];
    const curImage = Math.floor(Math.random() * images.length);

    return images[curImage];
  }

  public verifyRmt (msg: CommandoMessage) {
    if (msg.guild.id === '373826006651240450') return true;
    if (msg.guild.commandPrefix === '.') return true;
    if (msg.guild.settings.get('regexmatches', false)) return true;
    if (this.client.isOwner(msg.author)) return true;

    return false;
  }

  public run (msg: CommandoMessage) {
    if (msg.patternMatches && !this.verifyRmt(msg)) return null;
    startTyping(msg);
    msg.delete();
    stopTyping(msg);

    return msg.embed({
      color: msg.guild ? msg.guild.me.displayColor : 10610610,
      image: { url: this.fetchImage() },
    },
    'Please <@418504046337589249> get lost');
  }
}