import * as path from 'path';

const find = (moduleName: string) => {
    try {
        return require.resolve(moduleName);
    } catch (e) {
        return null;
    }
};

const searchCache = (moduleName: string, callback: (arg: any) => void) => {
    let mod = require.resolve(moduleName);
    const visited: any = {};

    /* tslint:disable-next-line:no-conditional-assignment */
    if (mod && ((mod = require.cache[mod]) !== undefined)) {

        const run = (current: any) => {
            visited[current.id] = true;

            current.children.forEach((child: any) => {

                if (path.extname(child.filename) !== '.node' && !visited[child.id]) {
                    run(child);
                }
            });

            callback(current);
        };

        run(mod);
    }
};

export const decache = (moduleName: string) => {
    moduleName = find(moduleName);

    if (!moduleName) return null;

    searchCache(moduleName, mod => {
        delete require.cache[mod.id]; /* tslint:disable-line:no-dynamic-delete*/
    });

    // @ts-ignore
    return Object.keys(module.constructor._pathCache).forEach(cacheKey => {
        if (cacheKey.indexOf(moduleName) > 0) {
            // @ts-ignore
            delete module.constructor._pathCache[cacheKey]; /* tslint:disable-line:no-dynamic-delete*/
        }
    });
};