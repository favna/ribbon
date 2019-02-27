import gulp from 'gulp';
import * as gulpTs from 'gulp-typescript';
import { argv } from 'yargs';
import terser from 'gulp-terser';

const compileSingleToJavaScript = (done) => {
    if (!argv.src) {
        console.error('At least 1 file has to be specified with the --src argument, f.e. --src ./src/commands/automod/badwords.ts')
        console.error('Specify multiple files by repeating the structure: --src ./src/commands/automod/badwords.ts --src ./src/commands/automod/duptext.ts')
        return done();
    }

    const targetFiles = argv.src.constructor === Array ? argv.src : [argv.src];

    for (const file of targetFiles) {
        const tsProject = gulpTs.createProject('./tsconfig.json');
        const filePath = file.split('/');
        let targetFolder = '';
        if (filePath[0] === '.') targetFolder = `./dist/${filePath[2]}/${filePath[3]}`;
        else targetFolder = `./dist/${filePath[1]}/${filePath[2]}`;

        gulp.src(file)
            .pipe(tsProject())
            .js.pipe(terser({compress: {ecma: 6, drop_console: true}}))
            .pipe(gulp.dest(targetFolder));
    }

    return done();
};

gulp.task('default', gulp.series(compileSingleToJavaScript));
gulp.task('reload', gulp.series('default'));
gulp.task('rebuild', gulp.series('default'));