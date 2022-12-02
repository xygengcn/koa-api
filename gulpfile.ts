import gulp from 'gulp';
import typescript from 'gulp-typescript';
import alias from 'gulp-ts-alias';
import { transformController } from './src/core/lib/utils/controller';
import path from 'path';
import fs from 'fs';
import config from './build.test.config';
import { rollup } from 'rollup';
import gulpClean from 'gulp-clean';

// 清理旧文件
gulp.task('clean-old', async () => {
    return gulp.src('dist-test', { read: false, allowEmpty: true }).pipe(gulpClean('dist-test'));
});

// tsc打包
gulp.task('tsc', () => {
    const tsProject = typescript.createProject('tsconfig.json');
    return tsProject
        .src()
        .pipe(alias({ config: 'tsconfig.json' }) as any)
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist-test'));
});

// 打包控制
gulp.task('tranform', async () => {
    const file = transformController(path.join(__dirname, './dist-test/src/controller'));
    fs.writeFileSync(path.join(__dirname, './dist-test/src/transform.js'), file, { encoding: 'utf8' });
});

// 全部打包
gulp.task('build', async () => {
    const subTask = await rollup(config as any);
    await subTask.write({
        dir: 'dist-test',
        format: 'cjs',
        exports: 'named'
    });
});

// 清理tsc生成的文件
gulp.task('clean-tsc', async () => {
    return gulp.src('dist-test/src', { read: false, allowEmpty: true }).pipe(gulpClean('dist-test/src'));
});

gulp.task('default', gulp.series(gulp.parallel('clean-old'), gulp.parallel('tsc'), gulp.parallel('tranform'), gulp.parallel('build')));
