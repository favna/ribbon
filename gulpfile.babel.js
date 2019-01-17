import gulp from 'gulp';
import jsdoc2md from 'jsdoc-to-markdown';
import jest from 'gulp-jest';
import ts from 'typescript';
import del from 'del';
import replace from 'gulp-string-replace';
import * as fs from 'fs';
import * as gulpTs from 'gulp-typescript';
import * as tslint from 'tslint';
import { argv } from 'yargs';
import { default as uglify } from 'gulp-uglify-es';
import { milkyLint, milkyReport } from 'milky-tslint';

const tsSource = ['./src/**/*.ts', './src/commands/**/*.ts'];
const copySource = ['./src/data/fonts/*', './src/data/databases/*', './src/.env', './src/data/dex/*.json'];
const jsdocOptions = {
    template: fs.readFileSync('./docs/template.hbs', 'utf8'),
    files: './dist/commands/*/*.js',
    'example-lang': 'nginx',
};
const replaceOptions = { logs: { enabled: false } };

const makeJavaScriptRunnable = () => {
    return gulp.src('./dist/Ribbon.js', { base: './dist' })
        .pipe(replace('typescript: true,', 'typescript: false,', replaceOptions))
        .pipe(replace(/.registerCommandsIn\({\n\s+dirname.+\n\s+filter.+\n\s+}\);/g, '.registerCommandsIn(path_1.default.join(__dirname, \'commands\'));', replaceOptions))
        .pipe(replace(/.registerTypesIn\({\n\s+dirname.+\n\s+filter.+\n\s+}\)/g, '.registerTypesIn(path_1.default.join(__dirname, \'components/commandoTypes\'))', replaceOptions))
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

const generateDocs = (done) => {
    const docs = jsdoc2md.renderSync(jsdocOptions);
    const docsJSON = jsdoc2md.getJsdocDataSync({ files: jsdocOptions.files });
    fs.writeFileSync('./docs/index.md', docs);
    fs.writeFileSync('../wikiribbon/All-Commands.md', docs);
    fs.writeFileSync('../homesite/src/assets/docs/ribbon.json', JSON.stringify(docsJSON));
    return done();
};

const compileForDocs = () => {
    const tsProject = gulpTs.createProject('./tsconfig.json', { removeComments: false });

    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('./dist'));
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
        .pipe(jest({
            preset: 'ts-jest',
            testEnvironment: 'node',
            testMatch: ['**/*.spec.ts'],
            setupTestFrameworkScriptFile: './test/jest.setup.ts',
        }));
});

gulp.task('clean', () => del(['./dist']));
gulp.task('watch', () => gulp.watch(tsSource, gulp.series('lint')));
gulp.task('docs', gulp.series('clean', compileForDocs, generateDocs, 'clean'));
gulp.task('build', gulp.series('clean', compileToJavaScript, gulp.parallel(copyAdditionalFiles, makeJavaScriptRunnable), minifyCode));
gulp.task('rebuild', gulp.series(compileSingleToJavaScript));
gulp.task('reload', gulp.series('rebuild'));
gulp.task('default', gulp.parallel('watch', 'lint'));