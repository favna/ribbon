import { sync as globby } from 'glob';
import yargsInteractive, { Option as YargOptions } from 'yargs-interactive';
import { join, resolve } from 'path';
import { stripIndent } from 'common-tags';
import chalk from 'chalk';
import { readFileSync as readFile, writeFileSync as writeFile } from 'fs';
import { TranspileOutput, CompilerOptions, transpileModule } from 'typescript';
import { readFileSync as readJson } from 'jsonfile';
import { minify as terser } from 'terser';

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

  const srcDir = join(__dirname, '../src');
  const commandDir = join(srcDir, 'commands');
  const ribbonCommands = globby(`${commandDir}/**/*.ts`).map(file => {
    const parts = file.split('/');
    const platform = process.platform.toLowerCase();

    if (platform === 'linux' || platform === 'darwin') return parts[8].slice(0, -3);

    return parts[6].slice(0, -3);
  });
  const baseTSConfig = readJson(resolve(srcDir, '..', 'tsconfig.json')) as BaseTSConfig;

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
        choices: ribbonCommands,
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

    for (const result of commandsResult) {
      const filePath = globby(`${commandDir}/**/${result}.ts`)[0];
      const fileContent = readFile(filePath, { encoding: 'utf8' });
      const transpiledModule = compile(fileContent).outputText;
      const minfiedModule = terser(transpiledModule, { compress: true, ecma: 6, mangle: true }).code;
      const distPath = filePath.replace(/\/src\//, '/dist/').replace(/\.ts$/, '.js');

      writeFile(distPath, minfiedModule, { encoding: 'utf8' });
    }
  } catch (err) {
    throw new Error(err);
  }
})();