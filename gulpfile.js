const fs = require('fs');
const gulp = require('gulp');
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
const { milkyLint, milkyReport } = require('milky-tslint');

const tsSource = ['./src/**/*.ts', './src/commands/**/*.ts'];
const copySource = ['./src/data/fonts/*', './src/data/databases/*', './src/.env', './src/data/dex/*.json'];
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

const generateDocs = (done) => {
    const docs = jsdoc.renderSync(jsdocOptions);
    // const docsJSON = jsdoc.renderSync({json: true, ...jsdocOptions});
    fs.writeFileSync('./docs/index.md', docs);
    fs.writeFileSync('../wikiribbon/All-Commands.md', docs);
    // fs.writeFileSync('../homesite/src/assets/docs/ribbon.json', docsJSON);
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
            .js.pipe(minifier())
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
gulp.task('build:docs', gulp.series('clean', compileForDocs));
gulp.task('rebuild', gulp.series(compileSingleToJavaScript));
gulp.task('reload', gulp.series('rebuild'));
gulp.task('default', gulp.parallel('watch', 'lint'));