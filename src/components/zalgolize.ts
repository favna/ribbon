import { roundNumber } from '.';

const chars: any = {
    all: null,
    down: [
        '̖',
        '̗',
        '̘',
        '̙',
        '̜',
        '̝',
        '̞',
        '̟',
        '̠',
        '̤',
        '̥',
        '̦',
        '̩',
        '̪',
        '̫',
        '̬',
        '̭',
        '̮',
        '̯',
        '̰',
        '̱',
        '̲',
        '̳',
        '̹',
        '̺',
        '̻',
        '̼',
        'ͅ',
        '͇',
        '͈',
        '͉',
        '͍',
        '͎',
        '͓',
        '͔',
        '͕',
        '͖',
        '͙',
        '͚',
        '̣'
    ],
    middle: [
        '̕',
        '̛',
        '̀',
        '́',
        '͘',
        '̡',
        '̢',
        '̧',
        '̨',
        '̴',
        '̵',
        '̶',
        '͏',
        '͜',
        '͝',
        '͞',
        '͟',
        '͠',
        '͢',
        '̸',
        '̷',
        '͡',
        '҉'
    ],
    pattern: null,
    up: [
        '̍',
        '̎',
        '̄',
        '̅',
        '̿',
        '̑',
        '̆',
        '̐',
        '͒',
        '͗',
        '͑',
        '̇',
        '̈',
        '̊',
        '͂',
        '̓',
        '̈́',
        '͊',
        '͋',
        '͌',
        '̃',
        '̂',
        '̌',
        '͐',
        '̀',
        '́',
        '̋',
        '̏',
        '̒',
        '̓',
        '̔',
        '̽',
        '̉',
        'ͣ',
        'ͤ',
        'ͥ',
        'ͦ',
        'ͧ',
        'ͨ',
        'ͩ',
        'ͪ',
        'ͫ',
        'ͬ',
        'ͭ',
        'ͮ',
        'ͯ',
        '̾',
        '͛',
        '͆',
        '̚'
    ],
};

chars.all = [].concat(chars.up, chars.middle, chars.down);
chars.pattern = RegExp(`(${chars.all.join('|')})`, 'g');

/* tslint:disable-next-line:max-line-length */
const multichars = /([\uD800-\uDBFF])([\uDC00-\uDFFF])([\uD800-\uDBFF])?([\uDC00-\uDFFF])?|([0-9])?([\0-\u02FF\u0370-\u1AAF\u1B00-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uE000-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])([\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F\uFE0F]+)/g;
const sub = '•';

const split = (str: string) => {
    const characters = str.replace(multichars, sub).split('');

    let m = null;
    let ri = 0;

    /* tslint:disable-next-line:no-conditional-assignment*/
    while ((m = multichars.exec(str))) {
        m.index -= ri;
        ri += m[0].length - 1;
        characters.splice(m.index, 1, m[0]);
    }

    return characters;
};

const rand = (max: number) => roundNumber(Math.random() * max);

export const banish = (zalgo: string) => zalgo.replace(chars.pattern, '');

export const zalgolize = (text: any) => {
    text = split(text);

    let result = '';
    const types: Array<string> = ['up', 'middle', 'down'];
    const counts: any = {
        down: rand(8) + 1,
        middle: rand(3),
        up: rand(8) + 1,
    };

    for (const letter of text) {
        if (chars.pattern.test(letter)) continue;
        if (letter.length > 1) {
            result += letter;
            continue;
        }

        result += letter;

        for (const type of types) {
            const tchars = chars[type];
            const max = tchars.length - 1;
            let count = counts[type];

            while (count--) {
                result += tchars[rand(max)];
            }
        }
    }

    return result;
};
