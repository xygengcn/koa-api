const { spawnSync } = require('child_process');

spawnSync('rm',['-rf','www']);

spawnSync('mkdir',['www']);

spawnSync('cp',['-r','build','www']);

spawnSync('cp',['-r','package.json','www']);

spawnSync('rm',['-rf','www/build/logs']);

console.log('打包完成')