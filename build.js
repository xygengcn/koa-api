const { spawnSync } = require('child_process');
const { writeFileSync } = require('fs');

spawnSync('rm', ['-rf', 'www'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
});

spawnSync('mkdir', ['www'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
});

spawnSync('cp', ['-r', 'app', 'www'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
});

spawnSync('cp', ['-r', 'pm2.json', 'www'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
});

spawnSync('rm', ['-rf', 'www/app/logs'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
});

// 处理packge

const package = require('./package.json');
delete package.devDependencies;
delete package.scripts.dev;
delete package.scripts.lint;
delete package.scripts.build;
delete package.scripts['dev:nodemon'];
delete package.scripts['dev:tsc'];

writeFileSync('./www/package.json', JSON.stringify(package, null, '\t'));

console.log('\033[32m 打包成功 \033[0m');
