/**
 * @file Custom KaiCommand - Custom Command exclusive to ChaosGamez server  
 * A joke command to spite Kai  
 * Server admins can disable this command entirely by using the `rmt off` command  
 * **Aliases**: `.kai`
 * @module
 * @category custom
 * @name kai
 * @returns {MessageEmbed} A MessageEmbed with a spiteful image and a mention to kai. Also deletes the other kai spites 🤔
 */

const {Command} = require('discord.js-commando'), 
  {stopTyping, startTyping} = require('../../components/util.js');

module.exports = class KaiCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'kai',
      memberName: 'kai',
      group: 'custom',
      description: 'Kai get lost',
      details: 'Custom commands can be made for your server too! Just join the support server (use the `stats` command) and request the command.',
      guildOnly: true,
      patterns: [/^\.kai$/im],
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  fetchImage () {
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
      ],
      curImage = Math.floor(Math.random() * images.length); // eslint-disable-line sort-vars

    return images[curImage];
  }


  verifyRmt (msg) {
    /* eslint-disable curly*/
    if (msg.guild.id === '373826006651240450') return true;
    if (msg.guild.commandPrefix === '.') return true;
    if (msg.guild.settings.get('regexmatches', false)) return true;
    if (this.client.isOwner(msg.author)) return true;

    return false;
  }

  run (msg) {
    if (msg.patternMatches && !this.verifyRmt(msg)) return null;
    /* eslint-enable curly*/
    startTyping(msg);
    msg.delete();
    stopTyping(msg);

    return msg.embed({
      image: {url: this.fetchImage()},
      color: msg.guild ? msg.guild.me.displayColor : 10610610
    },
    'Please <@418504046337589249> get lost');
  }
};