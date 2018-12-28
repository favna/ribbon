import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { startTyping, stopTyping } from '../../components';

export default class KuuIsGaeCommand extends Command {
    constructor (client: CommandoClient) {
        super(client, {
            name: 'kuuisgae',
            group: 'custom',
            memberName: 'kuuisgae',
            description: 'Kuu is gae',
            details: 'Custom commands can be made for your server too! Just join the support server (use the `stats` command) and request the command.',
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3,
            },
            patterns: [/^\.kuuisgae$/im],
        });
    }

    public async run (msg: CommandoMessage): Promise<any> {
        if (msg.patternMatches && !this.verifyRmt(msg)) return null;
        startTyping(msg);

        const reply = await msg.embed({
            color: 3447003,
            description: 'no 1 likez hem',
            image: { url: 'https://media.tenor.com/images/3254a2afd60d4a6a79a3f9ad73201780/tenor.gif' },
            title: 'so mega gae',
        }, '<@134309348632559616>') as Message;
        reply.react('527995950992588810');
        reply.react('527995970122940457');
        reply.react('527995993330024489');
        reply.react('527995982030307328');
        reply.react('527996003073130496');
        stopTyping(msg);

        return null;
    }

    private verifyRmt (msg: CommandoMessage) {
        if (msg.guild.id === '373826006651240450') return true;
        if (msg.guild.commandPrefix === '.') return true;
        if (msg.guild.settings.get('regexmatches', false)) return true;
        return this.client.isOwner(msg.author);
    }
}
