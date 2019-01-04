const fs = require('fs');
const gulp = require('gulp');
const gulpLint = require('gulp-tslint');
const gulpTs = require('gulp-typescript');
const jsdoc = require('jsdoc-to-markdown');
const tslint = require('tslint');
const ts = require('typescript');
const uglify = require('uglify-es');
const del = require('del');
const mocha = require('gulp-mocha');
const replace = require('gulp-string-replace');
const gulpUglifyCompose = require('gulp-uglify/composer');
const { argv } = require('yargs');

const tsSource = ['./src/**/*.ts', './src/commands/**/*.ts'];
const copySource = ['./src/data/fonts/*', './src/data/databases/*', './src/data/dex/*.json'];
const jsdocOptions = {
    template: fs.readFileSync('./docs/template.hbs', 'utf8'),
    files: './dist/commands/*/*.js',
    'example-lang': 'sh',
};
const replaceOptions = { logs: { enabled: false } };
const minifier = gulpUglifyCompose(uglify, console);

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
        .pipe(minifier())
        .pipe(gulp.dest('./dist'));
};

const generateDocs = () => {
    const docs = jsdoc.renderSync(jsdocOptions);
    fs.writeFileSync('./docs/docs.md', docs);
    return fs.writeFileSync('../wikiribbon/All-Commands.md', docs);
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
    return del(['./dist']);
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

gulp.task('docs', gulp.series('clean', compileForDocs, generateDocs, 'clean'));
gulp.task('build', gulp.series('clean', compileToJavaScript, gulp.parallel(copyAdditionalFiles, makeJavaScriptRunnable), minifyCode));
gulp.task('default', gulp.parallel('watch', 'lint'));