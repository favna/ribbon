import gulp from 'gulp';
import * as gulpTs from 'gulp-typescript';
import { argv } from 'yargs';
import { default as uglify } from 'gulp-uglify-es';

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

gulp.task('default', gulp.series(compileSingleToJavaScript));
gulp.task('reload', gulp.series('default'));
gulp.task('rebuild', gulp.series('default'));