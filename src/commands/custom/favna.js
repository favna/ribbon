/**
 * @file Custom FavnaCommand - Custom Command exclusive to ChaosGamez server  
 * A joke command to praise Favna  
 * Server admins can disable this command entirely by using the `rmt off` command  
 * **Aliases**: `.favna`
 * @module
 * @category custom
 * @name favna
 * @returns {MessageEmbed} A MessageEmbed with the joke text
 */

const {Command} = require('discord.js-commando'), 
  {oneLine} = require('common-tags'), 
  {stopTyping, startTyping} = require('../../components/util.js');

module.exports = class FavnaCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'favna',
      memberName: 'favna',
      group: 'custom',
      description: 'Favna is my father',
      details: 'Custom commands can be made for your server too! Just join the support server (use the `stats` command) and request the command.',
      guildOnly: true,
      patterns: [/^\.favna$/im],
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  verifyRmt (msg) {
    if (msg.guild.id === '373826006651240450') return true;
    if (msg.guild.commandPrefix === '.') return true;
    if (msg.guild.settings.get('regexmatches', false)) return true;
    if (this.client.isOwner(msg.author)) return true;

    return false;
  }

  run (msg) {
    if (msg.patternMatches && !this.verifyRmt(msg)) return null;

    startTyping(msg);
    msg.delete();
    stopTyping(msg);

    return msg.embed({
      image: {url: 'https://favna.xyz/images/ribbonhost/favnadedsec.gif'},
      color: msg.guild ? msg.guild.me.displayColor : 10610610,
      description: oneLine`Technically speaking my father, but to you he is your supreme leader and you will submit to him 
        or I will infect every single human being you have ever met with a virus so terrible their lungs and intestines
        will instantly explode from their chests causing a gorey, bloody mess all over the floor and you 
        will be the only person held responsible for the death of hundredths if not millions of people.`
    });
  }
};