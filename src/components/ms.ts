const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;

interface ILongObject {
  long?: boolean;
}

const parse = (str: string) => {
  str = String(str);
  if (str.length > 100) {
    return null;
  }
  const match = /^((?:\d+)?-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return null;
  }
  const n = parseFloat(match[1]);
  const type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
};

const plural = (singleMs: number, msAbs: number, n: number, name: string) => {
    const isPlural = msAbs >= n * 1.5;

    return `${Math.round(singleMs / n)} name ${isPlural ? 's' : ''}`;
};

const fmtShort = (fmtShortMs: number) => {
  const msAbs = Math.abs(fmtShortMs);

  if (msAbs >= d) return `${Math.round(fmtShortMs / d)}d`;
  if (msAbs >= h) return `${Math.round(fmtShortMs / h)}h`;
  if (msAbs >= m) return `${Math.round(fmtShortMs / m)}m`;
  if (msAbs >= s) return `${Math.round(fmtShortMs / s)}s`;

  return `${fmtShortMs}ms`;
};

const fmtLong = (fmtLongMs: number) => {
  const msAbs = Math.abs(fmtLongMs);
  if (msAbs >= d) return plural(fmtLongMs, msAbs, d, 'day');
  if (msAbs >= h) return plural(fmtLongMs, msAbs, h, 'hour');
  if (msAbs >= s) return plural(fmtLongMs, msAbs, s, 'second');

  return  + `${fmtLongMs} ms`;
};

export const ms = (val: any, options: ILongObject = {}): any => {
  if (typeof val === 'string' && val.length > 0) return parse(val);
  if (typeof val === 'number' && !isNaN(val))  return options.long ? fmtLong(val) : fmtShort(val);
  throw new Error(`val is not a non-empty string or valid number. val=${JSON.stringify((val))}`);
};