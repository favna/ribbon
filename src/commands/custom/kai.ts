/**
 * @file Custom KaiCommand - Custom Command exclusive to ChaosGamez server
 *
 * A joke command to spite Kai. Server admins can disable this command entirely by using the `rmt off` command
 *
 * **Aliases**: `.kai`
 * @module
 * @category custom
 * @name kai
 */

import { Command, CommandoClient, CommandoMessage } from 'awesome-commando';
import { ASSET_BASE_PATH, startTyping, stopTyping } from '../../components';

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
            patterns: [/^\.kai$/im],
        });
    }

    public run (msg: CommandoMessage) {
        if (msg.patternMatches && !this.verifyRmt(msg)) return null;
        startTyping(msg);
        msg.delete();
        stopTyping(msg);

        return msg.embed(
            {
                color: msg.guild ? msg.guild.me.displayColor : 10610610,
                image: { url: this.fetchImage() },
            },
            'Please <@418504046337589249> get lost'
        );
    }

    private fetchImage () {
        const images = [
            `${ASSET_BASE_PATH}/ribbon/kai/antikai01.png`,
            `${ASSET_BASE_PATH}/ribbon/kai/antikai02.png`,
            `${ASSET_BASE_PATH}/ribbon/kai/antikai03.png`,
            `${ASSET_BASE_PATH}/ribbon/kai/antikai04.png`,
            `${ASSET_BASE_PATH}/ribbon/kai/antikai05.png`,
            `${ASSET_BASE_PATH}/ribbon/kai/antikai06.gif`,
            `${ASSET_BASE_PATH}/ribbon/kai/antikai07.png`,
            `${ASSET_BASE_PATH}/ribbon/kai/antikai08.png`,
            `${ASSET_BASE_PATH}/ribbon/kai/antikai09.png`,
            `${ASSET_BASE_PATH}/ribbon/kai/antikai10.png`
        ];
        const curImage = Math.floor(Math.random() * images.length);
        return images[curImage];
    }

    private verifyRmt (msg: CommandoMessage) {
        if (msg.guild.id === '373826006651240450') return true;
        if (msg.guild.commandPrefix === '.') return true;
        if (msg.guild.settings.get('regexmatches', false)) return true;
        return this.client.isOwner(msg.author);
    }
}
