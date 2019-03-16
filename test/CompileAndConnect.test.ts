import { CommandoClient } from 'awesome-commando';
import path from 'path';

let client: CommandoClient;
beforeEach(() => {
    client = new CommandoClient({
        commandPrefix: 's!!',
        owner: '268792781713965056',
        typescript: true,
        fetchAllMembers: true,
    });

    client.registry
        .registerDefaultTypes()
        .registerTypesIn({
            dirname: path.join(__dirname, '../src/components/commandoTypes'),
            filter: (fileName: string) => /^.+Type\.ts$/.test(fileName) ? fileName : undefined,
        })
        .registerGroups([
            ['games', 'Games - Play some games'],
            ['casino', 'Casino - Gain and gamble points'],
            ['converters', 'Converters - Unit conversion on a new level'],
            ['info', 'Info - Discord info at your fingertips'],
            ['music', 'Music - Let the DJ out'],
            ['searches', 'Searches - Browse the web and find results'],
            ['leaderboards', 'Leaderboards - View leaderboards from various games'],
            ['pokemon', 'Pokemon - Let Dexter answer your questions'],
            ['extra', 'Extra - Extra! Extra! Read All About It! Only Two Cents!'],
            ['weeb', 'Weeb - Hugs, Kisses, Slaps and all with weeb animu gifs'],
            ['moderation', 'Moderation - Moderate with no effort'],
            ['automod', 'Automod - Let Ribbon moderate the chat for you'],
            ['streamwatch', 'Streamwatch - Spy on members and get notified when they go live'],
            ['custom', 'Custom - Server specific commands'],
            ['nsfw', 'NSFW - For all you dirty minds ( ͡° ͜ʖ ͡°)'],
            ['owner', 'Owner - Exclusive to the bot owner(s)']
        ])
        .registerCommandsIn({
            dirname: path.join(__dirname, '../src/commands'),
            filter: (fileName: string) => /^.+\.ts$/.test(fileName) ? fileName : undefined,
        });
});

afterEach(() => {
    client.destroy();
});

test('should conenct ', async () => {
    expect.assertions(4);

    return client.login(process.env.TEST_TOKEN).then(async () => {
        expect(client).toBeTruthy();
        expect(client.guilds).toBeTruthy();
        expect(client.channels).toBeTruthy();
        expect(client.users).toBeTruthy();
    });
});