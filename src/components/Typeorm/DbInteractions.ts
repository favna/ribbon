import { Snowflake } from 'awesome-djs';
import Casino, { CasinoData } from './Entities/Casino';
import connect from './DbConfig';

export const readCasino = async (userId: Snowflake, guildId: Snowflake) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  return casinoRepo.findOne({ userId, guildId });
};

export const readCasinoMultiple = async (data: { userId: Snowflake; guildId: Snowflake }[]) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  return casinoRepo.find({ where: data });
};

export const readCasinoLimited = async (guildId: Snowflake, limit: number) => {
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

export const writeCasino = async (data: CasinoData) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  const newCasino = new Casino(data);

  return casinoRepo.save(newCasino);
};

export const writeCasinoMultiple = async (data: CasinoData[]) => {
  const connection = await connect();
  const casinoRepo = connection.getRepository(Casino);

  data.map(entry => new Casino(entry));

  return casinoRepo.save(data);
};