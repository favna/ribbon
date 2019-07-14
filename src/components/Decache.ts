/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
import path from 'path';

const find = (moduleName: string) => {
  try {
    return require.resolve(moduleName);
  } catch (err) {
    return null;
  }
};

const searchCache = (moduleName: string, callback: (arg: any) => void) => {
  let mod = require.resolve(moduleName);
  const visited: any = {};

  if (mod && (mod = require.cache[mod]) !== undefined) {
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

export const decache = (moduleName: string | null): void => {
  if (moduleName) {
    moduleName = find(moduleName);

    searchCache(moduleName!, mod => {
      delete require.cache[mod.id];
    });

    return Object.keys((module.constructor as IModuleFunction)._pathCache).forEach(cacheKey => {
      if (cacheKey.indexOf(moduleName!) > 0) {
        delete (module.constructor as IModuleFunction)._pathCache[cacheKey];
      }
    });
  }

  return undefined;
};

type IModuleFunction = {
  _pathCache: any;
} & Function;