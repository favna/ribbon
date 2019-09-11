import chalk from 'chalk';
import { stripIndent } from 'common-tags';
import { readFileSync as readFile, writeFileSync as writeFile } from 'fs';
import { sync as globby } from 'glob';
import { readFileSync as readJson } from 'jsonfile';
import { join, resolve } from 'path';
import { minify as terser } from 'terser';
import { CompilerOptions, transpileModule, TranspileOutput } from 'typescript';
import yargsInteractive, { Option as YargOptions } from 'yargs-interactive';
import { ROOT_PATH, SRC_PATH } from '../utils/Constants';

(async () => {
  type YargResult = {
    help: boolean;
    version: boolean;
    interactive: boolean;
    command: string | string[];
  };

  type BaseTSConfig = {
    compilerOptions: CompilerOptions;
    include: string[];
    exclude: string[];
  };

  const commandsDir = join(SRC_PATH, 'commands');
  const commands = globby(`${commandsDir}/**/*.ts`).map(file => {
    const parts = file.split('/');

    return parts[parts.length - 1].slice(0, -3);
  });

  const baseTSConfig = readJson(resolve(ROOT_PATH, 'tsconfig.json')) as BaseTSConfig;

  const compile = (fileContent: string, options?: CompilerOptions): TranspileOutput => {
    const compilerOptions: typeof options = {
      ...baseTSConfig.compilerOptions,
      ...options,
    };

    return transpileModule(fileContent, { compilerOptions });
  };

  try {
    const yargOptions: YargOptions = {
      interactive: { default: true },
      command: {
        type: 'checkbox',
        describe: 'Which commands should be reloaded?',
        prompt: 'if-empty',
        choices: commands,
      },
    };

    const results = await yargsInteractive()
      .usage((stripIndent`
    ${chalk.yellow('Ribbon Reloader')}
    ${chalk.cyan('Usage:')}
        ${chalk.green('yarn reload')}
        ${chalk.green('yarn reload')} --command <command>
        ${chalk.green('yarn reload')} --help`
      ))
      .interactive(yargOptions) as YargResult;

    const commandsResult: string[] = Array.isArray(results.command) ? results.command : [ results.command ];

    if (!commandsResult.length) throw 'You didn\'t give any commands to reload';

    for (const result of commandsResult) {
      const filePath = globby(`${commandsDir}/**/${result}.ts`)[0];
      const fileContent = readFile(filePath, { encoding: 'utf8' });
      const transpiledModule = compile(fileContent).outputText;
      const minfiedModule = terser(transpiledModule, { compress: true, ecma: 6, mangle: true }).code;
      const distPath = filePath.replace(/\/src\//, '/dist/').replace(/\.ts$/, '.js');

      writeFile(distPath, minfiedModule, { encoding: 'utf8' });
    }

    console.info(chalk.green('Done!')); // eslint-disable-line no-console

    return process.exit(0);
  } catch (err) {
    console.error(chalk.red(err)); // eslint-disable-line no-console

    return process.exit(1);
  }
})();