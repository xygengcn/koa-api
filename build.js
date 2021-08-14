const { spawnSync } = require('child_process');

spawnSync('rm',['-rf','www']);

spawnSync('mkdir',['www']);

spawnSync('cp',['-r','app','www']);

spawnSync('cp',['-r','package.json','www']);

spawnSync('rm',['-rf','www/app/logs']);

console.log('\033[32m 打包成功 \033[0m')


