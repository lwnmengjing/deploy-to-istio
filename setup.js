const cp = require('child_process');
cp.exec('npm i && tsc', function (err){
  console.log(err);
  process.exit(1);
});
