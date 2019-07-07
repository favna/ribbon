import admin from 'firebase-admin';

export const getChannelsData = async (): Promise<string> => {
  const firestore = admin.firestore();
  const document = await firestore.doc('ribbon/channels').get();
  return document.get('value');
};

export const setChannelsData = async (value: string): Promise<void> => {
  const firestore = admin.firestore();
  await firestore.doc('ribbon/channels').update({ value });
};

export const getCommandsData = async (): Promise<string> => {
  const firestore = admin.firestore();
  const document = await firestore.doc('ribbon/commands').get();
  return document.get('value');
};

export const setCommandsData = async (value: string): Promise<void> => {
  const firestore = admin.firestore();
  await firestore.doc('ribbon/commands').update({ value });
};

export const getMessagesData = async (): Promise<string> => {
  const firestore = admin.firestore();
  const document = await firestore.doc('ribbon/messages').get();
  return document.get('value');
};

export const setMessagesData = async (value: string): Promise<void> => {
  const firestore = admin.firestore();
  await firestore.doc('ribbon/messages').update({ value });
};

export const getServersData = async (): Promise<string> => {
  const firestore = admin.firestore();
  const document = await firestore.doc('ribbon/servers').get();
  return document.get('value');
};

export const setServersData = async (value: string): Promise<void> => {
  const firestore = admin.firestore();
  await firestore.doc('ribbon/servers').update({ value });
};

export const setUptimeData = async (value: string): Promise<void> => {
  const firestore = admin.firestore();
  await firestore.doc('ribbon/uptime').update({ value });
};

export const getUsersData = async (): Promise<string> => {
  const firestore = admin.firestore();
  const document = await firestore.doc('ribbon/users').get();
  return document.get('value');
};

export const setUsersData = async (value: string): Promise<void> => {
  const firestore = admin.firestore();
  await firestore.doc('ribbon/users').update({ value });
};

