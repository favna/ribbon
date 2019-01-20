import gulp from 'gulp';
import jest from 'gulp-jest';
import ts from 'typescript';
import del from 'del';
import replace from 'gulp-replace';
import * as gulpTs from 'gulp-typescript';
import * as tslint from 'tslint';
import { argv } from 'yargs';
import { execSync } from 'child_process';
import { default as uglify } from 'gulp-uglify-es';
import { milkyLint, milkyReport } from 'milky-tslint';

const tsSource = ['./src/**/*.ts', './src/commands/**/*.ts'];
const copySource = ['./src/data/fonts/*', './src/data/databases/*', './src/.env', './src/data/dex/*.json'];

const makeJavaScriptRunnable = () => {
    return gulp.src('./dist/Ribbon.js', { base: './dist' })
        .pipe(replace('typescript: true,', 'typescript: false,'))
        .pipe(replace(/.registerCommandsIn\({\n\s+dirname.+\n\s+filter.+\n\s+}\);/g, '.registerCommandsIn(path_1.default.join(__dirname, \'commands\'));'))
        .pipe(replace(/.registerTypesIn\({\n\s+dirname.+\n\s+filter.+\n\s+}\)/g, '.registerTypesIn(path_1.default.join(__dirname, \'components/commandoTypes\'))'))
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

const generateRepoDocs = () => {
    const opts = {
        template: './docs/template.hbs',
        files: './dist/commands/**/*.js',
        exampleLang: 'nginx',
        outFile: './docs/index.md',
        outFolder: './docs'
    };
    execSync(`yarn jsdoc2md --template ${opts.template} --files ${opts.files} --example-lang ${opts.exampleLang} > ${opts.outFile}`);

    return gulp.src(opts.outFile, { base: opts.outFolder })
        .pipe(replace(/yarn run .+\n\$ .+\n/g, ''))
        .pipe(replace(/(\(Favna\))Done.+/, '(Favna)'))
        .pipe(gulp.dest(opts.outFolder));
};

const generateWikiDocs = () => {
    const opts = {
        template: './docs/template.hbs',
        files: './dist/commands/**/*.js',
        exampleLang: 'nginx',
        outFile: '../wikiribbon/All-Commands.md',
        outFolder: '../wikiribbon',
    };
    execSync(`yarn jsdoc2md --template ${opts.template} --files ${opts.files} --example-lang ${opts.exampleLang} > ${opts.outFile}`);

    return gulp.src(opts.outFile, { base: opts.outFolder })
        .pipe(replace(/yarn run .+\n\$ .+\n/g, ''))
        .pipe(replace(/(\(Favna\))Done.+/, '(Favna)'))
        .pipe(gulp.dest(opts.outFolder));
};

const generateSiteDocs = () => {
    const opts = {
        files: './dist/commands/**/*.js',
        outFile: '../homesite/src/assets/docs/ribbon.json',
        outFolder: '../homesite/src/assets/docs',
    };
    execSync(`yarn jsdoc2md --json --files ${opts.files} > ${opts.outFile}`);

    return gulp.src(opts.outFile, { base: opts.outFolder })
        .pipe(replace(/yarn run .+\n\$ .+\n/g, ''))
        .pipe(replace(/\nDone.+\n/g, ''))
        .pipe(gulp.dest(opts.outFolder));
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
gulp.task('docs', gulp.series('clean', compileForDocs, gulp.parallel(generateRepoDocs, generateWikiDocs, generateSiteDocs), 'clean'));
gulp.task('build', gulp.series('clean', compileToJavaScript, gulp.parallel(copyAdditionalFiles, makeJavaScriptRunnable), minifyCode));
gulp.task('rebuild', gulp.series(compileSingleToJavaScript));
gulp.task('reload', gulp.series('rebuild'));
gulp.task('default', gulp.parallel('watch', 'lint'));