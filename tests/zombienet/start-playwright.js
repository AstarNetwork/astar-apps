const util = require('util');

const spawn = (cmd) =>
  new Promise((resolve, reject) => {
    const cp = require('child_process').exec(cmd);
    const error = [];
    const stdout = [];
    cp.stdout.on('data', (data) => {
      console.log(data.toString());
      stdout.push(data.toString());

      if (data.toString().includes('Ctrl+C')) {
        cp.kill(9);
        if (error.length) reject(error.join(''));
        else resolve(stdout.join(''));
      }
    });

    cp.on('error', (e) => {
      error.push(e.toString());
      console.log(e.toString());
    });

    cp.on('close', () => {
      if (error.length) reject(error.join(''));
      else resolve(stdout.join(''));
    });
  });

async function run(nodeName, networkInfo, args) {
  console.log('Running Playwright tests on node: ', nodeName, args);
  const endpoint = networkInfo.nodesByName[nodeName].wsUri;

  let result = await spawn('npx playwright install');
  
  result = await spawn(
    `BASE_URL=\'${args[0]}\' ENDPOINT=\'${endpoint}\'  HEADLESS='true' npx playwright test --project=chromium`
  );

  return result?.includes('failed') ? 0 : 1;
}

module.exports = { run };
