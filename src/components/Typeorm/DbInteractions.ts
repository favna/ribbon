import Casino, { CasinoData } from './Entities/Casino';
import connect from './DbConfig';
import Pasta, { PastaData } from './Entities/Pasta';
import Reminder, { ReminderData } from './Entities/Reminder';

/** Fetches a single casino entry by userId and guildId */
export const readCasino = async (userId: Casino['userId'], guildId: Casino['guildId']) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  return casinoRepo.findOne({ userId, guildId });
};

/** Fetches multiple casino entries by userId and guildId */
export const readCasinoMultiple = async (data: { userId: Casino['userId']; guildId: Casino['guildId'] }[]) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  return casinoRepo.find({ where: data });
};

/** Fetches multiple casino entries limited by limit, for guildId and ordered by Balance */
export const readCasinoLimited = async (guildId: Casino['guildId'], limit: number) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  return casinoRepo.find(
    {
      where: { guildId },
      take: limit,
      order: { balance: 'DESC' },
    }
  );
};

/** Writes a single casino entry */
export const writeCasino = async (data: CasinoData) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  const newCasino = new Casino(data);

  return casinoRepo.save(newCasino);
};

/** Writes multiple casino entries */
export const writeCasinoMultiple = async (data: CasinoData[]) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  data.map(entry => new Casino(entry));

  return casinoRepo.save(data);
};

/** Fetches a single pasta by name */
export const readPasta = async (name: Pasta['name'], guildId: Pasta['name']) => {
  const connection = await connect();
  const pastaRepo = connection.getRepository(Pasta);

  return pastaRepo.findOne({ name, guildId });
};

/** Finds all pastas by guildId */
export const readAllPastas = async (guildId: Pasta['guildId']) => {
  const connection = await connect();
  const pastaRepo = connection.getRepository(Pasta);

  return pastaRepo.find({ guildId });
};

/** Writes a new or overwrites an existing pasta */
export const writePasta = async (data: PastaData) => {
  const connection = await connect();
  const pastaRepo = connection.getRepository(Pasta);

  const newPasta = new Pasta(data);

  return pastaRepo.save(newPasta);
};

/** Removes a pasta by name and guildId */
export const deletePasta = async (name: Pasta['name'], guildId: Pasta['name']) => {
  const connection = await connect();
  const pastaRepo = connection.getRepository(Pasta);

  return pastaRepo.delete({ name, guildId });
};

/** Writes a new reminder */
export const writeReminder = async (data: ReminderData) => {
  const connection = await connect();
  const reminderRepo = connection.getRepository(Reminder);

  const newReminder = new Reminder(data);

  return reminderRepo.save(newReminder);
};