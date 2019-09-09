// import { decache } from '@utils/Decache';
import { getChannelsData, getCommandsData, getMessagesData, getServersData, getUsersData } from '@utils/FirebaseActions';
import FirebaseStorage from '@utils/FirebaseStorage';
// import fs from 'fs-nextra';
import { Event } from 'klasa';
// import path from 'path';

export default class AEvent extends Event {
  async run() {
    // const formatsWatcher = fs.watch(path.join(__dirname, '../', 'data/dex/formats.json'));
    // formatsWatcher.on('change', () => {
    //   decache(path.join(__dirname, '../', 'data/dex/formats.json'));
    //   this.client.commands.get('dex').reload();
    // });

    FirebaseStorage.channels = parseInt(await getChannelsData());
    FirebaseStorage.commands = parseInt(await getCommandsData());
    FirebaseStorage.messages = parseInt(await getMessagesData());
    FirebaseStorage.servers = parseInt(await getServersData());
    FirebaseStorage.users = parseInt(await getUsersData());
  }
}