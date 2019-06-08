import { ArgumentType, CommandoClient } from 'awesome-commando';

export default class CurrencyType extends ArgumentType {
    private timeIds: Set<string>;
    private duration: number;

    constructor (client: CommandoClient) {
        super(client, 'duration');
        this.timeIds = new Set([
            'ms', 'millisecond', 'milliseconds',
            's', 'second', 'seconds',
            'm', 'min', 'mins', 'minute', 'minutes',
            'h', 'hr', 'hour', 'hours',
            'd', 'day', 'days',
            'w', 'week', 'weeks',
            'mo', 'month', 'months',
            'y', 'year', 'years'
        ]);
        this.duration = 0;
    }

    public validate (value: string) {
        const MATCHES_ALL = value.match(/(\d+)\s*([A-Za-z]+)/g);

        if (MATCHES_ALL) {
            for (const match of MATCHES_ALL) {
                const tempNum = match.match(/(\d+)/g);
                const tempStr = match.match(/([A-Za-z]+)/g);
                if (!tempNum || (tempNum.length !== 1)) return false;
                if (!tempStr || (tempStr.length !== 1)) return false;
                if (!Number.isInteger(parseInt(tempNum[0], 10))) return false;
                if (!this.timeIds.has(tempStr[0])) return false;
            }
            return true;
        }

        return false;
    }

    public parse (value: string) {
        const MATCHES_ALL = value.match(/(\d+)\s*([A-Za-z]+)/g);

        if (MATCHES_ALL) {
            let totalTime: number = 0;
            MATCHES_ALL.forEach((dur: string) => {
                const tempNum = parseInt(dur.match(/(\d+)/g)![0], 10);
                const tempStr = dur.match(/([A-Za-z]+)/g)![0];
                if (isNaN(tempNum)) totalTime = 0;
                else totalTime += tempNum * this.determineTimeType(tempStr);
            });
            if (totalTime) {
                this.duration = totalTime;
                return this.duration;
            }
        }

        return null;
    }

    private determineTimeType (str: string): number {
        switch (str) {
            case 'ms': case 'millisecond': case 'milliseconds':
                return 1;
            case 's': case 'second': case 'seconds':
                return 1000;
            case 'm': case 'min': case 'mins': case 'minute': case 'minutes':
                return 60 * 1000;
            case 'h': case 'hr': case 'hour': case 'hours':
                return 60 * 60 * 1000;
            case 'd': case 'day': case 'days':
                return 24 * 60 * 60 * 1000;
            case 'w': case 'week': case 'weeks':
                return 7 * 24 * 60 * 60 * 1000;
            case 'mo': case 'month': case 'months':
                return 30 * 24 * 60 * 60 * 1000;
            case 'y': case 'year': case 'years':
                return 365 * 24 * 60 * 60 * 1000;
            default:
                return 1;
        }
    }
}