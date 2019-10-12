// import { decache } from '@utils/Decache';
import { getChannelsData, getCommandsData, getMessagesData, getServersData, getUsersData } from '@utils/FirebaseActions';
import FirebaseStorage from '@utils/FirebaseStorage';
// import fs from 'fs-nextra';
import { Event } from 'klasa';
// import path from 'path';
import createDatabaseConnection from '@typeorm/DbConfig';

export default class extends Event {
  async run() {
    // const formatsWatcher = fs.watch(path.join(__dirname, '../', 'data/dex/formats.json'));
    // formatsWatcher.on('change', () => {
    //   decache(path.join(__dirname, '../', 'data/dex/formats.json'));
    //   this.client.commands.get('dex').reload();
    // });

    // Populate the usernames
    for (const user of this.client.users.values()) {
      this.client.usertags.set(user.id, user.tag);
    }

    // Clear all users
    this.client.users.clear();

    // Fill the dictionary name for faster user fetching
    for (const guild of this.client.guilds.values()) {
      const me = guild.me!;

      // Populate the snowflakes
      for (const member of guild.members.values()) {
        guild.memberSnowflakes.add(member.id);
      }

      // Set the proper client me
      guild.members.set(me.id, me);
    }

    const ConnectionData = await Promise.all([
      getChannelsData(),
      getCommandsData(),
      getMessagesData(),
      getServersData(),
      getUsersData(),
      createDatabaseConnection()
    ]);

    const [ channels, commands, messages, servers, users ] = ConnectionData;

    FirebaseStorage.channels = parseInt(channels);
    FirebaseStorage.commands = parseInt(commands);
    FirebaseStorage.messages = parseInt(messages);
    FirebaseStorage.servers = parseInt(servers);
    FirebaseStorage.users = parseInt(users);
  }
}