/**
 * @file Pokémon PokemonTCGCommand - Gets information on a Pokemon card  
 * At start of the command you can specify which properties you want to use for the search, the options are `name`, `types`, `subtype`, `supertype` and `hp`  
 * After specifying which options you want to use, Ribbon will go through the options asking you the values to use for the search  
 * By default only `name` is used as argument and the supertype is set to pokemon  
 * name is the name of the pokemon card  
 * types are the types of the pokemon card (only works with pokemon as supertype)  
 * subtype specifies the subtype of a card (ex: MEGA, Stage 1, BREAK, Supporter)  
 * supertype specifies the supertype of a card (pokemon, trainer or energy)  
 * hp specifies the hp of a pokemon  
 * **Aliases**: `ptcg`, `tcgo`
 * @module
 * @category pokémon
 * @name TCG
 * @example tcg name types subtype
 * @param {StringResolvable} Properties Properties you want to use for your search
 * @returns {MessageEmbed} Pokemon TCG card details
 */

const fetch = require('node-fetch'),
  moment = require('moment'),
  querystring = require('querystring'),
  {Command, ArgumentCollector} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {stopTyping, startTyping} = require('../../components/util.js');

module.exports = class PokemonTCGCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tcg',
      memberName: 'tcg',
      group: 'pokemon',
      aliases: ['ptcg', 'tcgo'],
      description: 'Gets information on a Pokemon card',
      details: stripIndents`At start of the command you can specify which properties you want to use for the search, the options are \`name\`, \`types\`, \`subtype\`, \`supertype\` and \`hp\`
      After specifying which options you want to use, Ribbon will go through the options asking you the values to use for the search
      By default only \`name\` is used as argument and the supertype is set to pokemon
      name is the name of the pokemon card
      types are the types of the pokemon card (only works with pokemon as supertype)
      subtype specifies the subtype of a card (ex: MEGA, Stage 1, BREAK, Supporter)
      supertype specifies the supertype of a card (pokemon, trainer or energy)
      hp specifies the hp of a pokemon`,
      format: 'Properties',
      examples: ['tcg name types subtype'],
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      },
      args: [
        {
          key: 'props',
          prompt: stripIndents`Which properties to search by? Can be any combination of \`name\`, \`types\`, \`subtype\`, \`supertype\` and \`hp\`
                Split each property with a \`space\`
                Use the help command (\`help tcg\`) to view examples`,
          type: 'string',
          default: ['name'],
          validate: (vals) => {
            const props = vals.split(' '),
              validProps = ['name', 'types', 'subtype', 'supertype', 'hp'];

            if (props.every(prop => validProps.indexOf(prop) !== -1)) {
              return true;
            }

            return stripIndents`Has to be any combination of ${validProps.map(val => `\`${val}\``).join(', ')}
            Respond with your new selection or`;
          },
          parse: p => p.split(' ')
        }
      ]
    });
  }

  /* eslint-disable max-statements, complexity*/
  async run (msg, {props}) {
    startTyping(msg);
    const command = msg,
      properties = {
        name: '',
        types: '',
        subtype: '',
        supertype: 'pokemon',
        hp: ''
      },
      tcgEmbed = new MessageEmbed();

    let messagesDeletable = false;

    if (props.includes('name')) {
      const namePicker = new ArgumentCollector(command.client, [
          {
            key: 'name',
            prompt: stripIndents`Name of the card to find?
      **Note:** Do not specify "EX" and such here, that goes in the \`subtype\``,
            type: 'string',
            parse: p => p.toLowerCase()
          }
        ], 1),
        nameSelection = await namePicker.obtain(command, [], 1);

      properties.name = nameSelection.values.name;
      nameSelection.prompts[0].delete();
      if (nameSelection.answers[0].deletable) {
        messagesDeletable = true;
        nameSelection.answers[0].delete();
        msg.delete();
      }
    }

    if (props.includes('types')) {
      const typePicker = new ArgumentCollector(command.client, [
          {
            key: 'types',
            prompt: 'Which types can the Pokemon be (ex. Fire, Fighting, Psychic, etc.)?',
            type: 'string',
            parse: p => p.replace(/ /gm, ',').toLowerCase()
          }
        ], 1),
        typeSelection = await typePicker.obtain(command, [], 1);

      properties.types = typeSelection.values.types;
      typeSelection.prompts[0].delete();
      if (messagesDeletable) typeSelection.answers[0].delete();
    }

    if (props.includes('subtype')) {
      const subTypePicker = new ArgumentCollector(command.client, [
          {
            key: 'subtype',
            prompt: 'What can the card\'s subtype be (ex. MEGA, Stage 1, BREAK, Supporter etc.)?',
            type: 'string',
            parse: p => p.toLowerCase()
          }
        ], 1),
        subTypeSelection = await subTypePicker.obtain(command, [], 1);

      properties.subtype = subTypeSelection.values.subtype;
      subTypeSelection.prompts[0].delete();
      if (messagesDeletable) subTypeSelection.answers[0].delete();
    }

    if (props.includes('supertype')) {
      const superTypePicker = new ArgumentCollector(command.client, [
          {
            key: 'supertype',
            prompt: 'What can the card\'s super be (one of pokemon, trainer or energy)?',
            type: 'string',
            validate: (type) => {
              const validTypes = ['pokemon', 'trainer', 'energy'];

              if (validTypes.includes(type.toLowerCase())) {
                return true;
              }

              return stripIndents`Has to be one of ${validTypes.map(val => `\`${val}\``).join(', ')}
            Respond with your new selection or`;
            },
            parse: p => p.toLowerCase()
          }
        ], 1),
        superTypeSelection = await superTypePicker.obtain(command, [], 1);

      properties.supertype = superTypeSelection.values.supertype;
      superTypeSelection.prompts[0].delete();
      if (messagesDeletable) superTypeSelection.answers[0].delete();
    }

    if (props.includes('hp')) {
      const hpPicker = new ArgumentCollector(command.client, [
          {
            key: 'hp',
            prompt: 'How much HP does the pokemon have?',
            type: 'integer'
          }
        ], 1),
        hpSelection = await hpPicker.obtain(command, [], 1);

      properties.hp = hpSelection.values.hp.toString();
      hpSelection.prompts[0].delete();
      if (messagesDeletable) hpSelection.answers[0].delete();
    }

    try {
      const res = await fetch(`https://api.pokemontcg.io/v1/cards?${querystring.stringify({
          page: 1,
          pageSize: 10,
          name: properties.name,
          supertype: properties.supertype,
          subtype: properties.subtype ? properties.subtype : '',
          types: properties.types ? properties.types : '',
          hp: properties.hp ? properties.hp : ''
        })}`),
        poke = await res.json();

      if (poke.cards.length) {
        const {cards} = poke;
        let body = '';

        for (let i = 0, n = cards.length; i < n; ++i) {
          body += `**${parseInt(i, 10) + 1}:** ${cards[i].name}\n`;
        }

        // eslint-disable-next-line one-var
        const selectionEmbed = await command.embed({
          thumbnail: {url: 'https://favna.xyz/images/ribbonhost/tcglogo.png'},
          color: command.guild ? command.member.displayColor : 14827841,
          description: body
        });

        // eslint-disable-next-line one-var
        const cardChooser = new ArgumentCollector(command.client, [
          {
            key: 'card',
            prompt: 'Send number to see details or cancel to cancel',
            type: 'integer',
            validate: (v) => {
              if (v >= 1 && v <= 10) {
                return true;
              }

              return 'Please choose a number between 1 and 10';
            },
            parse: p => p - 1
          }
        ], 1);

        // eslint-disable-next-line one-var
        const cardSelection = await cardChooser.obtain(command, [], 1),
          selection = cardSelection.values.card;

        cardSelection.prompts[0].delete();
        selectionEmbed.delete();
        if (messagesDeletable) cardSelection.answers[0].delete();

        tcgEmbed
          .setColor(msg.guild ? msg.member.displayHexColor : '#7CFC00')
          .setThumbnail('https://favna.xyz/images/ribbonhost/tcglogo.png')
          .setTitle(`${cards[selection].name} (${cards[selection].id})`)
          .setImage(cards[selection].imageUrl)
          .addField('Series', cards[selection].series, true)
          .addField('Set', cards[selection].set, true);

        if (properties.supertype === 'pokemon') {
          const {attacks} = cards[selection], 
            {resistances} = cards[selection], 
            {weaknesses} = cards[selection];

          attacks.forEach((item, index) => {
            tcgEmbed.addField(`Attack ${parseInt(index, 10) + 1}`, stripIndents`
              **Name:** ${item.name}
              **Description:** ${item.text}
              **Damage:** ${item.damage}
              **Cost:** ${item.cost.join(', ')}
              `, true);
          });

          if (resistances) {
            resistances.forEach((item, index) => {
              tcgEmbed.addField(`Resistance ${parseInt(index, 10) + 1}`, stripIndents`
              **Type:** ${item.type}
              **Multiplier:** ${item.value}
              `, true);
            });
          }

          if (weaknesses) {
            weaknesses.forEach((item, index) => {
              tcgEmbed.addField(`Weakness ${parseInt(index, 10) + 1}`, stripIndents`
              **Type:** ${item.type}
              **Multiplier:** ${item.value}
              `, true);
            });
          }

          tcgEmbed.fields.shift();
          tcgEmbed.fields.shift();

          tcgEmbed
            .addField('Type(s)', cards[selection].types.join(', '), true)
            .addField('Subtype', cards[selection].subtype, true)
            .addField('HP', cards[selection].hp, true)
            .addField('Retreat Cost', cards[selection].convertedRetreatCost, true)
            .addField('Series', cards[selection].series, true)
            .addField('Set', cards[selection].set, true);
        } else if (properties.supertype === 'trainer') {
          tcgEmbed.setDescription(cards[selection].text[0]);
        }
        stopTyping(msg);
        
        return command.embed(tcgEmbed);
      }
      stopTyping(msg);
      
      return command.reply(stripIndents`no cards were found for that query.
        Be sure to check the command help (\`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}help tcg\`) if you want to know how to use this command `);
    } catch (err) {
      stopTyping(msg);

      this.client.channels.resolve(process.env.ribbonlogchannel).send(stripIndents`
      <@${this.client.owners[0].id}> Error occurred in \`tcg\` command!
      **Server:** ${msg.guild.name} (${msg.guild.id})
      **Author:** ${msg.author.tag} (${msg.author.id})
      **Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
      **Props:** ${props.map(val => `\`${val}\``).join(', ')}
      **Name:** \`${properties.name}\`
      **Types:** \`${properties.types}\`
      **Subtype:** \`${properties.subtype}\`
      **Supertype:** \`${properties.supertype}\`
      **HP:** \`${properties.hp}\`
      **Error Message:** ${err}
      `);

      return msg.reply(oneLine`An error occurred but I notified ${this.client.owners[0].username}
        Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild.commandPrefix}invite\` command `);
    }
  }
};