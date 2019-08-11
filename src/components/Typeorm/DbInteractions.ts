import Casino, { CasinoData } from './Entities/Casino';
import connect from './DbConfig';
import Pasta, { PastaData } from './Entities/Pasta';
import Reminder, { ReminderData } from './Entities/Reminder';
import Countdown, { CountdownData } from './Entities/Countdown';
import Timer, { TimerData } from './Entities/Timer';
import Warning, { WarningData } from './Entities/Warning';
import CasinoTimeout, { CasinoTimeoutData } from './Entities/CasinoTimeout';

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

/** Fetches all Casino data by guildId */
export const readAllCasinoForGuild = async (guildId: Casino['guildId']) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  return casinoRepo.find({ guildId });
};

/** Fetches all Casino data */
export const readAllCasino = async () => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  return casinoRepo.find();
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

/** Removes a casino entry by userId and guildId */
export const deleteCasino = async (userId: Casino['userId'], guildId: Casino['guildId']) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  return casinoRepo.delete({ userId, guildId });
};

/** Fetches a single Casino Timeout entry by guildId */
export const readCasinoTimeout = async (guildId: CasinoTimeout['guildId']) => {
  const connection = await connect();
  const casinoTimeoutRepo = connection.getRepository(CasinoTimeout);

  return casinoTimeoutRepo.findOne({ where: { guildId }, select: [ 'timeout' ] });
};

/** Writes a single Casino Timeout entry */
export const writeCasinoTimeout = async (data: CasinoTimeoutData) => {
  const connection = await connect();
  const casinoTimeoutRepo = connection.getRepository(CasinoTimeout);

  const newCasinoTimeout = new CasinoTimeout(data);

  return casinoTimeoutRepo.save(newCasinoTimeout);
};

/** Fetches a single pasta by name */
export const readPasta = async (name: Pasta['name'], guildId: Pasta['name']) => {
  const connection = await connect();
  const pastaRepo = connection.getRepository(Pasta);

  return pastaRepo.findOne({ name, guildId });
};

/** Fetches all pastas by guildId */
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
export const deletePasta = async (name: Pasta['name'], guildId: Pasta['guildId']) => {
  const connection = await connect();
  const pastaRepo = connection.getRepository(Pasta);

  return pastaRepo.delete({ name, guildId });
};

/** Fetches all reminders */
export const readAllReminders = async () => {
  const connection = await connect();
  const reminderRepo = connection.getRepository(Reminder);

  return reminderRepo.find();
};

/** Writes a new reminder */
export const writeReminder = async (data: ReminderData) => {
  const connection = await connect();
  const reminderRepo = connection.getRepository(Reminder);

  const newReminder = new Reminder(data);

  return reminderRepo.save(newReminder);
};

export const deleteReminder = async (id: Reminder['id']) => {
  const connection = await connect();
  const reminderRepo = connection.getRepository(Reminder);

  return reminderRepo.delete({ id });
};

/** Fetches a single countdown by name */
export const readCountdown = async (name: Countdown['name'], guildId: Countdown['name']) => {
  const connection = await connect();
  const countdownRepo = connection.getRepository(Countdown);

  return countdownRepo.findOne({ name, guildId });
};

/** Fetches all countdowns by guildId */
export const readAllCountdownsForGuild = async (guildId: Countdown['guildId']) => {
  const connection = await connect();
  const countdownRepo = connection.getRepository(Countdown);

  return countdownRepo.find({ guildId });
};

/** Fetches all countdown data */
export const readAllCountdowns = async () => {
  const connection = await connect();
  const countdownRepo = connection.getRepository(Countdown);

  return countdownRepo.find();
};

/** Writes a new or overwrites an existing countdown */
export const writeCountdown = async (data: CountdownData) => {
  const connection = await connect();
  const countdownRepo = connection.getRepository(Countdown);

  const newCountdown = new Countdown(data);

  return countdownRepo.save(newCountdown);
};

/** Removes a countdown by name and guildId */
export const deleteCountdown = async (name: Countdown['name'], guildId: Countdown['guildId']) => {
  const connection = await connect();
  const countdownRepo = connection.getRepository(Countdown);

  return countdownRepo.delete({ name, guildId });
};

/** Fetches a single timer by name */
export const readTimer = async (name: Timer['name'], guildId: Timer['name']) => {
  const connection = await connect();
  const timerRepo = connection.getRepository(Timer);

  return timerRepo.findOne({ name, guildId });
};

/** Fetches all timers by guildId */
export const readAllTimersForGuild = async (guildId: Timer['guildId']) => {
  const connection = await connect();
  const timerRepo = connection.getRepository(Timer);

  return timerRepo.find({ guildId });
};

/** Fetches all timer data */
export const readAllTimers = async () => {
  const connection = await connect();
  const timerRepo = connection.getRepository(Timer);

  return timerRepo.find();
};

/** Writes a new or overwrites an existing timer */
export const writeTimer = async (data: TimerData) => {
  const connection = await connect();
  const timerRepo = connection.getRepository(Timer);

  const newTimer = new Timer(data);

  return timerRepo.save(newTimer);
};

/** Removes a timer by name and guildId */
export const deleteTimer = async (name: Timer['name'], guildId: Timer['guildId']) => {
  const connection = await connect();
  const timerRepo = connection.getRepository(Timer);

  return timerRepo.delete({ name, guildId });
};

/** Fetches the warning data for a single user in a guild */
export const readWarning = async (userId: Warning['userId'], guildId: Warning['guildId']) => {
  const connection = await connect();
  const warningRepo = connection.getRepository(Warning);

  return warningRepo.findOne({ userId, guildId });
};

/** Writes a new or overwrites an existing warning entry */
export const writeWarning = async (data: WarningData) => {
  const connection = await connect();
  const warningRepo = connection.getRepository(Warning);

  const newWarning = new Warning(data);

  return warningRepo.save(newWarning);
};

/** Updates a currently existing warning with the new amount of points */
export const updateWarning = async (data: WarningData) => {
  const connection = await connect();
  const warningRepo = connection.getRepository(Warning);

  const updatedWarning = new Warning(data);

  return warningRepo.save(updatedWarning);
};