import { decache } from '@components/Decache';
import { getChannelsData, getCommandsData, getMessagesData, getServersData, getUsersData } from '@components/FirebaseActions';
import FirebaseStorage from '@components/FirebaseStorage';
import fs from 'fs';
import { Event } from 'klasa';
import path from 'path';

export default class AEvent extends Event {
  async run() {
    fs.watch(path.join(__dirname, 'data/dex/formats.json'),
      (eventType, filename) => {
        if (filename) {
          decache(path.join(__dirname, 'data/dex/formats.json'));
          this.client.commands.get('dex').reload();
        }
      }
    );

    FirebaseStorage.channels = parseInt(await getChannelsData());
    FirebaseStorage.commands = parseInt(await getCommandsData());
    FirebaseStorage.messages = parseInt(await getMessagesData());
    FirebaseStorage.servers = parseInt(await getServersData());
    FirebaseStorage.users = parseInt(await getUsersData());
  }
}