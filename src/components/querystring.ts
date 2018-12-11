const stringifyPrimitive = (v: any): string => {
    switch (typeof v) {
        case 'string':
            return v;
        case 'boolean':
            return v ? 'true' : 'false';
        case 'number':
            return isFinite(v) ? v.toString() : '';
        default:
            return '';
    }
};

const hasOwnProperty = (obj: object, prop: any) => Object.prototype.hasOwnProperty.call(obj, prop);

export const stringify = (obj: any, sep: string = '&', eq: string = '='): string => {
    if (obj === null) obj = undefined;
    if (typeof obj === 'object') {
        return Object.keys(obj)
            .map(key => {
                const ks = encodeURIComponent(stringifyPrimitive(key)) + eq;
                if (obj[key] === undefined) return '';
                if (obj[key] === null) return encodeURIComponent(key);
                if (Array.isArray(obj[key])) {
                    return obj[key]
                        .map((v: string) => ks + encodeURIComponent(stringifyPrimitive(v)))
                        .join(sep);
                } else {
                    return (
                        ks + encodeURIComponent(stringifyPrimitive(obj[key]))
                    );
                }
            }).filter(Boolean).join(sep);
    }

    return encodeURIComponent(stringifyPrimitive(obj));
};

export const parse = (qs: any = '', sep: string = '&', eq: string = '='): any => {
    if (qs === '') return {};
    if (qs.startsWith('?')) qs = qs.slice(1);
    const obj: any = {};
    const regexp = /\+/g;
    qs = qs.split(sep);

    const maxKeys = 1000;

    let len = qs.length;
    if (maxKeys > 0 && len > maxKeys) len = maxKeys;

    for (let i = 0; i < len; ++i) {
        const x = qs[i].replace(regexp, '%20');
        const idx = x.indexOf(eq);
        let kstr;
        let vstr;

        if (idx >= 0) {
            kstr = x.substr(0, idx);
            vstr = x.substr(idx + 1);
        } else {
            kstr = x;
            vstr = '';
        }

        const k = decodeURIComponent(kstr);
        const v = decodeURIComponent(vstr);

        if (!hasOwnProperty(obj, k)) {
            obj[k] = v;
        } else if (Array.isArray(obj[k])) {
            obj[k].push(v);
        } else {
            obj[k] = [obj[k], v];
        }
    }

    return obj;
};
