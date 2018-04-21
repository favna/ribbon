/* eslint-disable one-var */

const deleteCommandMessages = function (msg, client) { // eslint-disable-line consistent-return
  if (msg.deletable && client.provider.get(msg.guild, 'deletecommandmessages', false)) {
    return msg.delete();
  }
};

const capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const memberFilterExact = function (search) {
  return mem => mem.user.username.toLowerCase() === search ||
    (mem.nickname && mem.nickname.toLowerCase() === search) ||
    `${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
};

const memberFilterInexact = function (search) {
  return mem => mem.user.username.toLowerCase().includes(search) ||
    (mem.nickname && mem.nickname.toLowerCase().includes(search)) ||
    `${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(search);
};

const roundNumber = function (num, scale = 0) {
  if (!String(num).includes('e')) {
    return Number(`${Math.round(`${num}e+${scale}`)}e-${scale}`);
  }
  const arr = `${num}`.split('e');
  let sig = '';

  if (Number(arr[1]) + scale > 0) {
    sig = '+';
  }

  return Number(`${Math.round(`${Number(arr[0])}e${sig}${Number(arr[1]) + scale}`)}e-${scale}`);
};

const stopTyping = function (msg) {
  msg.channel.stopTyping(true);
};

const startTyping = function (msg) {
  msg.channel.startTyping(1);
};

const userSearch = async function (client, message, search) {
  let member = '';
  const matches = search.match(/^(?:<@!?)?([0-9]+)>?$/);

  if (matches) {
    try {
      return await message.guild.members.fetch(await message.client.users.fetch(matches[1]));
    } catch (err) {
      return false;
    }
  }
  member = await message.guild.members.filterArray(memberFilterInexact(search));
  if (member.length === 0) {
    return null;
  }
  if (member.length === 1) {
    return member[0];
  }
  member = member.filter(memberFilterExact(search));
  if (member.length === 1) {
    return member[0];
  }

  return null;
};

module.exports = {
  capitalizeFirstLetter,
  deleteCommandMessages,
  roundNumber,
  stopTyping,
  startTyping,
  userSearch
};