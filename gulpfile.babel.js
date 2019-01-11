import gulp from 'gulp';
import * as gulpTs from 'gulp-typescript';
import { default as uglify } from 'gulp-uglify-es';
import * as tslint from 'tslint';
import ts from 'typescript';
import del from 'del';
import mocha from 'gulp-mocha';
import replace from 'gulp-string-replace';
import { argv } from 'yargs';
import { exec } from 'child_process';
import { milkyLint, milkyReport } from 'milky-tslint';
import { oneLine } from 'common-tags';

const tsSource = ['./src/**/*.ts', './src/commands/**/*.ts'];
const copySource = ['./src/data/fonts/*', './src/data/databases/*', './src/.env', './src/data/dex/*.json'];
const replaceOptions = { logs: { enabled: false } };

const makeJavaScriptRunnable = () => {
    return gulp.src('./dist/Ribbon.js', { base: './dist' })
        .pipe(replace('typescript: true,', 'typescript: false,', replaceOptions))
        .pipe(replace(/.registerCommandsIn\({\n\s+dirname.+\n\s+filter.+\n\s+}\);/g, '.registerCommandsIn(path.join(__dirname, \'commands\'));', replaceOptions))
        .pipe(gulp.dest('./dist'));
};

const copyAdditionalFiles = () => {
    return gulp.src(copySource, { base: './src' })
        .pipe(gulp.dest('./dist/'));
};

const minifyCode = () => {
    return gulp.src('./dist/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
};

const compileToJavaScript = () => {
    const tsProject = gulpTs.createProject('./tsconfig.json');

    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('./dist'));
};

const compileSingleToJavaScript = (done) => {
    if (!argv.src) {
        console.group('error log');
        console.error('You have to supply a comma separated list of source files to compile');
        console.error('for example');
        console.error('./src/commands/automod/badwords.ts');
        console.error('./src/commands/automod/badwords.ts;./src/commands/automod/duptext.ts');
        console.groupEnd();
        return done();
    }

    const targetFiles = argv.src.split(',');

    for (const file of targetFiles) {
        const tsProject = gulpTs.createProject('./tsconfig.json');
        const filePath = file.split('/');
        let targetFolder = '';
        if (filePath[0] === '.') targetFolder = `./dist/${filePath[2]}/${filePath[3]}`;
        else targetFolder = `./dist/${filePath[1]}/${filePath[2]}`;

        gulp.src(file)
            .pipe(tsProject())
            .js.pipe(uglify())
            .pipe(gulp.dest(targetFolder));
    }

    return done();
};

gulp.task('lint', () => {
    const lintProgram = tslint.Linter.createProgram('./tsconfig.json', '.');
    ts.getPreEmitDiagnostics(lintProgram);

    return gulp.src(tsSource)
        .pipe(milkyLint({
            configuration: './tslint.json',
            program: lintProgram,
            tslint: tslint,
            fix: !!argv.fix,
        }))
        .pipe(milkyReport());
});

gulp.task('test', () => {
    return gulp.src('./test/')
        .pipe(mocha({
            ui: 'mocha-typescript',
            require: ['ts-node/register', 'source-map-support/register'],
            file: './test/testSetup.spec.ts',
            recursive: './test/**/*.spec.ts',
        }));
});

gulp.task('docs', () => {
    const opts = {
        template: './docs/template.hbs',
        exampleLang: 'nginx',
        inputFiles: './src/commands/*/*.ts',
        configFile: './config/jsdoc2md.json',
        outFile: './docs/index.md',
    };
    const docsCommand = oneLine`node ./node_modules/jsdoc-to-markdown/bin/cli.js
        --files ${opts.inputFiles}
        --template ${opts.template}
        --example-lang ${opts.exampleLang}
        --configure ${opts.configFile}
        > ${opts.outFile}`;
    return exec(docsCommand);
});

gulp.task('clean', () => del(['./dist']));
gulp.task('watch', () => gulp.watch(tsSource, gulp.series('lint')));
gulp.task('build', gulp.series('clean', compileToJavaScript, gulp.parallel(copyAdditionalFiles, makeJavaScriptRunnable), minifyCode));
gulp.task('rebuild', gulp.series(compileSingleToJavaScript));
gulp.task('reload', gulp.series('rebuild'));
gulp.task('default', gulp.parallel('watch', 'lint'));