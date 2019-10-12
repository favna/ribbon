/* eslint-disable max-len, object-curly-newline  */
import { KlasaClient, PermissionLevels } from 'klasa';
import moment from 'moment';
import { join } from 'path';
import { prod } from './Utils';

// Maps
export const currencySymbolMap: {[propName: string]: string} = {AED: 'د.إ', AFN: '؋', ALL: 'L', AMD: '֏', ANG: 'ƒ', AOA: 'Kz', ARS: '$', AUD: '$', AWG: 'ƒ', AZN: '₼', BAM: 'KM', BBD: '$', BDT: '৳', BGN: 'лв', BHD: '.د.ب', BIF: 'FBu', BMD: '$', BND: '$', BOB: '$b', BRL: 'R$', BSD: '$', BTC: '฿', BTN: 'Nu.', BWP: 'P', BYR: 'Br', BYN: 'Br', BZD: 'BZ$', CAD: '$', CDF: 'FC', CHF: 'CHF', CLP: '$', CNY: '¥', COP: '$', CRC: '₡', CUC: '$', CUP: '₱', CVE: '$', CZK: 'Kč', DJF: 'Fdj', DKK: 'kr', DOP: 'RD$', DZD: 'دج', EEK: 'kr', EGP: '£', ERN: 'Nfk', ETB: 'Br', ETH: 'Ξ', EUR: '€', FJD: '$', FKP: '£', GBP: '£', GEL: '₾', GGP: '£', GHC: '₵', GHS: 'GH₵', GIP: '£', GMD: 'D', GNF: 'FG', GTQ: 'Q', GYD: '$', HKD: '$', HNL: 'L', HRK: 'kn', HTG: 'G', HUF: 'Ft', IDR: 'Rp', ILS: '₪', IMP: '£', INR: '₹', IQD: 'ع.د', IRR: '﷼', ISK: 'kr', JEP: '£', JMD: 'J$', JOD: 'JD', JPY: '¥', KES: 'KSh', KGS: 'лв', KHR: '៛', KMF: 'CF', KPW: '₩', KRW: '₩', KWD: 'KD', KYD: '$', KZT: 'лв', LAK: '₭', LBP: '£', LKR: '₨', LRD: '$', LSL: 'M', LTC: 'Ł', LTL: 'Lt', LVL: 'Ls', LYD: 'LD', MAD: 'MAD', MDL: 'lei', MGA: 'Ar', MKD: 'ден', MMK: 'K', MNT: '₮', MOP: 'MOP$', MRO: 'UM', MRU: 'UM', MUR: '₨', MVR: 'Rf', MWK: 'MK', MXN: '$', MYR: 'RM', MZN: 'MT', NAD: '$', NGN: '₦', NIO: 'C$', NOK: 'kr', NPR: '₨', NZD: '$', OMR: '﷼', PAB: 'B/.', PEN: 'S/.', PGK: 'K', PHP: '₱', PKR: '₨', PLN: 'zł', PYG: 'Gs', QAR: '﷼', RMB: '￥', RON: 'lei', RSD: 'Дин.', RUB: '₽', RWF: 'R₣', SAR: '﷼', SBD: '$', SCR: '₨', SDG: 'ج.س.', SEK: 'kr', SGD: '$', SHP: '£', SLL: 'Le', SOS: 'S', SRD: '$', SSP: '£', STD: 'Db', STN: 'Db', SVC: '$', SYP: '£', SZL: 'E', THB: '฿', TJS: 'SM', TMT: 'T', TND: 'د.ت', TOP: 'T$', TRL: '₤', TRY: '₺', TTD: 'TT$', TVD: '$', TWD: 'NT$', TZS: 'TSh', UAH: '₴', UGX: 'USh', USD: '$', UYU: '$U', UZS: 'лв', VEF: 'Bs', VND: '₫', VUV: 'VT', WST: 'WS$', XAF: 'FCFA', XBT: 'Ƀ', XCD: '$', XOF: 'CFA', XPF: '₣', YER: '﷼', ZAR: 'R', ZWD: 'Z$'};
export const eightBallPredictionsMap: string[] = [ 'It is certain', 'It is decidedly so', 'Without a doubt', 'Yes definitely', 'You may rely on it', 'As I see it, yes', 'Most likely', 'Outlook good', 'Yes', 'Signs point to yes', 'Reply hazy try again', 'Ask again later', 'Better not tell you now', 'Cannot predict now', 'Concentrate and ask again', 'Don\'t count on it', 'My reply is no', 'My sources say no', 'Outlook not so good', 'Very doubtful' ];
export const pubgRegionsMap: string[] = [ '- `xbox-na` for Xbox in North America', '- `xbox-oc` for Xbox in Oceania', '- `xbox-eu` for Xbox in Europe', '- `xbox-as` for Xbox in Asia', '- `pc-sa` for PC in South and Central America', '- `pc-sea` for PC in South East Asia', '- `pc-na` for PC in North America', '- `pc-kakao` for PC in Kakao', '- `pc-krjp` for PC in Korea', '- `pc-oc` for PC in Oceania', '- `pc-eu` for PC in Europe', '- `pc-ru` for PC in Russia', '- `pc-jp` for PC in Japan', '- `pc-as` for PC in Asia' ];

// Constants
export const ASSET_BASE_PATH = 'https://storage.googleapis.com/data-sunlight-146313.appspot.com';
export const DEFAULT_EMBED_COLOR = '#3498DB';
export const DEFAULT_VOLUME = 3;
export const MAX_LENGTH = 10;
export const MAX_SONGS = 3;
export const PAGINATED_ITEMS = 5;
export const DURA_FORMAT = '[in] Y[ year, ]M[ month, ]D[ day, ]H[ hour and ]m[ minute]';
export const MOMENT_LOG_FORMAT = 'YYYY-MM-DD_HH:mm';

// paths
export const ROOT_PATH: string = join(__dirname, '..', '..', '..');
export const SRC_PATH: string = join(ROOT_PATH, 'src');
export const LIB_FOLDER: string = join(SRC_PATH, 'lib');

// Cron strings
export const EVERY_MINUTE = '*/1 * * * *';
export const EVERY_THREE_MINUTES = '*/3 * * * *';
export const EVERY_THIRD_HOUR = '0 */3 * * *';

export const CLIENT_OPTIONS = {
  commandEditing: true,
  commandLogging: !prod,
  console: { useColor: true },
  consoleEvents: {
    debug: !prod,
    verbose: !prod,
  },
  customPromptDefaults: {
    limit: 5,
    quotedStringSupport: true,
  },
  noPrefixDM: true,
  prefix: prod ? '!' : '.',
  typing: true,
  permissionLevels: new PermissionLevels()
    .add(0, () => true)
    .add(1, ({ guild, member }) => guild! && member!.permissions.has('MANAGE_NICKNAMES'), { fetch: true })
    .add(2, ({ guild, member }) => guild! && member!.permissions.has('MANAGE_MESSAGES'), { fetch: true })
    .add(3, ({ guild, member }) => guild! && member!.permissions.has('MANAGE_ROLES'), { fetch: true })
    .add(4, ({ guild, member }) => guild! && member!.permissions.has('KICK_MEMBERS'), { fetch: true })
    .add(5, ({ guild, member }) => guild! && member!.permissions.has('BAN_MEMBERS'), { fetch: true })
    .add(6, ({ guild, member }) => guild! && member!.permissions.has('MANAGE_GUILD'), { fetch: true })
    .add(7, ({ guild, member }) => guild! && member!.permissions.has('ADMINISTRATOR'), { fetch: true })
    .add(8, ({ guild, member }) => guild! && member === guild!.owner, { fetch: true })
    .add(9, ({ author, client }) => client.owners.has(author), { break: true })
    .add(10, ({ author, client }) => client.owners.has(author)),
  pieceDefaults: {
    commands: {
      deletable: true,
      quotedStringSupport: true,
    },
  },
  providers: { default: 'firestore' },
  presence: {
    status: 'online',
    activity: {
      name: prod ? '@Ribbon help' : '@Unraveled help',
      type: 'WATCHING',
    },
  },
  readyMessage: (client: KlasaClient) => `Client ready at ${moment().format('HH:mm:ss')}. Logged in as ${client.user!.tag} (${client.user!.id})`,
  disabledEvents: [
    'CHANNEL_PINS_UPDATE', 'CHANNEL_UPDATE', 'GUILD_BAN_ADD',
    'GUILD_BAN_REMOVE', 'GUILD_EMOJIS_UPDATE', 'GUILD_INTEGRATIONS_UPDATE',
    'GUILD_ROLE_CREATE', 'GUILD_ROLE_DELETE', 'GUILD_ROLE_UPDATE',
    'TYPING_START', 'WEBHOOKS_UPDATE', 'MESSAGE_REACTION_REMOVE_ALL'
  ],
  ws: { compress: true },
  restTimeOffset: 800,
  messageCacheLifetime: 10 * 60,
  messageSweepInterval: 5 * 60,
  schedule: { interval: 5000 },
};

// Enums
export enum IGBDAgeRating {Three = 1, Seven = 2, Twelve = 3, Sixteen = 4, Eighteen = 5, RP = 6, EC = 7, E = 8, E10 = 9, T = 10, M = 11, AO = 12}
export enum CoinSide {heads = 'heads', head = 'heads', tails = 'tails', tail = 'tails'}
export enum MassUnit {mcg = 'mcg', microgram = 'mcg', micrograms = 'mcg', mg = 'mg', milligram = 'mg', milligrams = 'mg', g = 'g', gram = 'g', grams = 'g', kg = 'kg', kilogram = 'kg', kilograms = 'kg', mt = 'mt', tonne = 'mt', tonnes = 'mt', 'metric-tonne' = 'mt', metricTonne = 'mt', 'metric-tonnes' = 'mt', metricTonnes = 'mt', oz = 'oz', ounce = 'oz', ounces = 'oz', lb = 'lb', pound = 'lb', pounds = 'lb', t = 't', ton = 't', tons = 't'}
export enum LengthUnit {mm = 'mm', millimeter = 'mm', millimeters = 'mm', millimetre = 'mm', millimetres = 'mm', cm = 'cm', centimeter = 'cm', centimeters = 'cm', centimetre = 'cm', centimetres = 'cm', dm = 'dm', decimeter = 'dm', decimeters = 'dm', decimetre = 'dm', decimetres = 'dm', m = 'm', meter = 'm', meters = 'm', metre = 'm', metres = 'm', dem = 'dem', dekameter = 'dem', dekameters = 'dem', dekametre = 'dem', dekametres = 'dem', decameter = 'dem', decameters = 'dem', decametre = 'dem', decametres = 'dem', hm = 'hm', hectometer = 'hm', hectometers = 'hm', hectometre = 'hm', hecometres = 'hm', km = 'km', kilometer = 'km', kilometers = 'km', kilometre = 'km', kilometres = 'km', in = 'in', inch = 'in', inches = 'in', yd = 'yd', yard = 'yd', yards = 'yd', 'ft-us' = 'ft-us', ft = 'ft', foot = 'ft', feet = 'ft', fathom = 'fathom', fathoms = 'fathom', mi = 'mi', mile = 'mi', miles = 'mi', nmi = 'nmi', neutical = 'nmi', 'neutical-mile' = 'nmi'}
export enum TemperatureUnit {c = 'c', celsius = 'c', proper = 'c', k = 'k', kelvin = 'k', f = 'f', fahrenheit = 'f', idiot = 'f', r = 'r', rankine = 'r'}

export enum Currency {AED = 'AED', AFN = 'AFN', ALL = 'ALL', AMD = 'AMD', ANG = 'ANG', AOA = 'AOA', ARS = 'ARS', AUD = 'AUD', AWG = 'AWG', AZN = 'AZN', BAM = 'BAM', BBD = 'BBD', BDT = 'BDT', BGN = 'BGN', BHD = 'BHD', BIF = 'BIF', BMD = 'BMD', BND = 'BND', BOB = 'BOB', BRL = 'BRL', BSD = 'BSD', BTC = 'BTC', BTN = 'BTN', BTS = 'BTS', BWP = 'BWP', BYN = 'BYN', BZD = 'BZD', CAD = 'CAD', CDF = 'CDF', CHF = 'CHF', CLF = 'CLF', CLP = 'CLP', CNH = 'CNH', CNY = 'CNY', COP = 'COP', CRC = 'CRC', CUC = 'CUC', CUP = 'CUP', CVE = 'CVE', CZK = 'CZK', DASH = 'DASH', DJF = 'DJF', DKK = 'DKK', DOGE = 'DOGE', DOP = 'DOP', DZD = 'DZD', EAC = 'EAC', EGP = 'EGP', EMC = 'EMC', ERN = 'ERN', ETB = 'ETB', ETH = 'ETH', EUR = 'EUR', FCT = 'FCT', FJD = 'FJD', FKP = 'FKP', FTC = 'FTC', GBP = 'GBP', GEL = 'GEL', GGP = 'GGP', GHS = 'GHS', GIP = 'GIP', GMD = 'GMD', GNF = 'GNF', GTQ = 'GTQ', GYD = 'GYD', HKD = 'HKD', HNL = 'HNL', HRK = 'HRK', HTG = 'HTG', HUF = 'HUF', IDR = 'IDR', ILS = 'ILS', IMP = 'IMP', INR = 'INR', IQD = 'IQD', IRR = 'IRR', ISK = 'ISK', JEP = 'JEP', JMD = 'JMD', JOD = 'JOD', JPY = 'JPY', KES = 'KES', KGS = 'KGS', KHR = 'KHR', KMF = 'KMF', KPW = 'KPW', KRW = 'KRW', KWD = 'KWD', KYD = 'KYD', KZT = 'KZT', LAK = 'LAK', LBP = 'LBP', LD = 'LD', LKR = 'LKR', LRD = 'LRD', LSL = 'LSL', LTC = 'LTC', LYD = 'LYD', MAD = 'MAD', MDL = 'MDL', MGA = 'MGA', MKD = 'MKD', MMK = 'MMK', MNT = 'MNT', MOP = 'MOP', MRO = 'MRO', MRU = 'MRU', MUR = 'MUR', MVR = 'MVR', MWK = 'MWK', MXN = 'MXN', MYR = 'MYR', MZN = 'MZN', NAD = 'NAD', NGN = 'NGN', NIO = 'NIO', NMC = 'NMC', NOK = 'NOK', NPR = 'NPR', NVC = 'NVC', NXT = 'NXT', NZD = 'NZD', OMR = 'OMR', PAB = 'PAB', PEN = 'PEN', PGK = 'PGK', PHP = 'PHP', PKR = 'PKR', PLN = 'PLN', PPC = 'PPC', PYG = 'PYG', QAR = 'QAR', RON = 'RON', RSD = 'RSD', RUB = 'RUB', RWF = 'RWF', SAR = 'SAR', SBD = 'SBD', SCR = 'SCR', SDG = 'SDG', SEK = 'SEK', SGD = 'SGD', SHP = 'SHP', SLL = 'SLL', SOS = 'SOS', SRD = 'SRD', SSP = 'SSP', STD = 'STD', STN = 'STN', STR = 'STR', SVC = 'SVC', SYP = 'SYP', SZL = 'SZL', THB = 'THB', TJS = 'TJS', TMT = 'TMT', TND = 'TND', TOP = 'TOP', TRY = 'TRY', TTD = 'TTD', TWD = 'TWD', TZS = 'TZS', UAH = 'UAH', UGX = 'UGX', USD = 'USD', UYU = 'UYU', UZS = 'UZS', VEF = 'VEF', VEF_BLKMKT = 'VEF_BLKMKT', VEF_DICOM = 'VEF_DICOM', VEF_DIPRO = 'VEF_DIPRO', VND = 'VND', VTC = 'VTC', VUV = 'VUV', WST = 'WST', XAF = 'XAF', XAG = 'XAG', XAU = 'XAU', XCD = 'XCD', XDR = 'XDR', XMR = 'XMR', XOF = 'XOF', XPD = 'XPD', XPF = 'XPF', XPM = 'XPM', XPT = 'XPT', XRP = 'XRP', YER = 'YER', ZAR = 'ZAR', ZMW = 'ZMW', ZWL = 'ZWL', }

export enum CollectorTimeout {
  one = 1 * 60 * 1000,
  two = 2 * 60 * 1000,
  five = 5 * 60 * 1000,
  ten = 10 * 60 * 1000,
}

export enum GoogleSource {
  KNOWLEDGE = 'knowledge',
  CSE = 'cse',
}