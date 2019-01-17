import Database from 'better-sqlite3';
import { Client, SyncSQLiteProvider } from 'discord.js-commando';
import path from 'path';

test('should connect then disconnect', async () => {
    const client = new Client({
        commandPrefix: 's!!',
        owner: '268792781713965056',
        unknownCommandResponse: false,
        typescript: true,
    });
    const db = new Database(path.join(__dirname, '../src/data/databases/settings.sqlite3'));

    client.setProvider(new SyncSQLiteProvider(db));
    let readyTracker = false;

    client.registry.registerDefaults();
    await client.login(process.env.TEST_TOKEN);

    client.on('ready', () => {
        readyTracker = true;
        client.destroy();
        process.exit();
        expect(readyTracker).toBe(true);
    });
});