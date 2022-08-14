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
    return gulp.src('test', { read: false, allowEmpty: true }).pipe(gulpClean('test'));
});

// tsc打包
gulp.task('tsc', () => {
    const tsProject = typescript.createProject('tsconfig.json');
    return tsProject
        .src()
        .pipe(alias({ config: 'tsconfig.json' }))
        .pipe(tsProject())
        .js.pipe(gulp.dest('test/tsc'));
});

// 打包控制
gulp.task('tranform', async () => {
    const file = transformController(path.join(__dirname, './test/tsc/controller'));
    fs.writeFileSync(path.join(__dirname, './test/tsc/transform.js'), file, { encoding: 'utf8' });
});

// 全部打包
gulp.task('build', async () => {
    const subTask = await rollup(config as any);
    await subTask.write({
        dir: 'test',
        format: 'cjs'
    });
});

// 清理tsc生成的文件
gulp.task('clean-tsc', async () => {
    return gulp.src('test/tsc', { read: false, allowEmpty: true }).pipe(gulpClean('test/tsc'));
});

gulp.task('default', gulp.series(gulp.parallel('clean-old'), gulp.parallel('tsc'), gulp.parallel('tranform'), gulp.parallel('build'), gulp.parallel('clean-tsc')));
