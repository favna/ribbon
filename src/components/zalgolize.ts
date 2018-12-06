import { multiCharsRegex, roundNumber, zalgoDownMap, zalgoMiddleMap, zalgoUpMap } from '.';

const chars: any = {
    all: null,
    down: zalgoDownMap,
    middle: zalgoMiddleMap,
    pattern: null,
    up: zalgoUpMap,
};

chars.all = [].concat(chars.up, chars.middle, chars.down);
chars.pattern = RegExp(`(${chars.all.join('|')})`, 'g');

/* tslint:disable-next-line:max-line-length */
const multichars = multiCharsRegex;
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
    const types: string[] = ['up', 'middle', 'down'];
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
