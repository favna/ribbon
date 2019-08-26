import { Event } from 'klasa';
import fs from 'fs';
import path from 'path';
import { decache } from '@components/Decache';
import FirebaseStorage from '@components/FirebaseStorage';
import { getChannelsData, getCommandsData, getMessagesData, getServersData, getUsersData } from '@components/FirebaseActions';

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