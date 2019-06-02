import gulp from 'gulp';
import terser from 'gulp-terser';
import typescript from 'gulp-typescript';
import { argv } from 'yargs';

const compileSingleToJavaScript = (done: () => void) => {
    if (!argv.src) {
        global.console.error('At least 1 file has to be specified with the --src argument, f.e. --src ./src/commands/info/userinfo.ts');
        global.console.error('Specify multiple files by repeating the structure: --src ./src/commands/info/userinfo.ts --src ./src/commands/info/stats.ts');
        return done();
    }

    const targetFiles: any = (argv as any).src.constructor === Array ? argv.src : [argv.src];

    for (const file of targetFiles) {
        const tsProject = typescript.createProject('./tsconfig.json');
        const filePath = file.split('/');
        let targetFolder = '';
        // tslint:disable-next-line:prefer-conditional-expression
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