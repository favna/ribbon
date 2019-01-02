const colors = require('colors');
const gulp = require('gulp');
const gulpLint = require('gulp-tslint');
const gulpTs = require('gulp-typescript');
const tslint = require('tslint');
const ts = require('typescript');
const uglify = require('uglify-es');
const del = require('del');
const mocha = require('gulp-mocha');
const replace = require('gulp-string-replace');
const gulpUglifyCompose = require('gulp-uglify/composer');
const { argv } = require('yargs');
const { exec } = require('child_process');

const tsSource = ['./src/**/*.ts', './src/commands/**/*.ts'];
const copySource = ['./src/data/fonts/*', './src/data/databases/*', './src/data/dex/*.json'];
const replaceOptions = { logs: { enabled: false } };
const minifier = gulpUglifyCompose(uglify, console);

const replaceInSource = () => {
    return gulp.src('./dist/Ribbon.js', { base: './dist' })
        .pipe(replace('typescript: true,', 'typescript: false,', replaceOptions))
        .pipe(replace(/.registerCommandsIn\({\n\s+dirname.+\n\s+filter.+\n\s+}\);/g, '.registerCommandsIn(path.join(__dirname, \'commands\'));', replaceOptions))
        .pipe(gulp.dest('./dist'));
};

const copySourceFiles = () => {
    return gulp.src(copySource, { base: './src' })
        .pipe(gulp.dest('./dist/'));
};

const minify = () => {
    return gulp.src('./dist/**/*.js')
        .pipe(minifier())
        .pipe(gulp.dest('./dist'));
};

const docgen = () => {
    return exec('yarn docs', (err, stdout, stderr) => {
        console.log(colors.green(stdout));
        console.log(colors.red(stderr));
    });
};

const compileForDocs = () => {
    const tsProject = gulpTs.createProject('./tsconfig.json', { removeComments: false });

    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('./dist'));
};

const compile = () => {
    const tsProject = gulpTs.createProject('./tsconfig.json');

    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('./dist'));
};

gulp.task('lint', () => {
    const lintProgram = tslint.Linter.createProgram('./tsconfig.json', '.');
    ts.getPreEmitDiagnostics(lintProgram);

    return gulp.src(tsSource)
        .pipe(gulpLint({
            configuration: './tslint.json',
            formatter: 'stylish',
            program: lintProgram,
            tslint: tslint,
            fix: !!argv.fix,
        }))
        .pipe(gulpLint.report({
            emitError: false,
            summarizeFailureOutput: true,
        }));
});

gulp.task('clean', () => {
    return del(['./dist', './docs/source']);
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

gulp.task('watch', () => {
    gulp.watch(tsSource, gulp.series('lint'));
});

gulp.task('docs', gulp.series(compileForDocs, docgen, 'clean'));
gulp.task('build', gulp.series('clean', compile, gulp.parallel(copySourceFiles, replaceInSource), minify));
gulp.task('default', gulp.parallel('watch', 'lint'));