/* eslint-disable @typescript-eslint/no-var-requires */
const spawn = (cmd) =>
  new Promise((resolve, reject) => {
    const cp = require('child_process').exec(cmd);
    const error = [];
    const stdout = [];
    cp.stdout.on('data', (data) => {
      stdout.push(data.toString());
      console.info(data.toString())

      if (data.toString().includes('Ctrl+C')) {
        cp.kill(9);
        if (error.length) reject(error.join(''));
        else resolve(stdout.join(''));
      }
    });

    cp.on('error', (e) => {
      error.push(e.toString());
      console.error(e.toString());
    });

    cp.on('close', () => {
      if (error.length) reject(error.join(''));
      else resolve(stdout.join(''));
    });
  });

async function run(nodeName, networkInfo, args) {
  console.info('Running Playwright tests on node: ', nodeName, args);
  const endpoint = networkInfo.nodesByName[nodeName].wsUri;
  console.info('endpoint :', endpoint);

  let result = await spawn('npx playwright install --with-deps');
  result = await spawn(
    `BASE_URL=\'${args[0]}\' ENDPOINT=\'${endpoint}\'  HEADLESS='true' CI='true' npx playwright test tests/test_specs --project=chromium`
  );

  // MEMO: for debugging specific test case
  // result = await spawn(
  //   `BASE_URL=\'${args[0]}\' ENDPOINT=\'${endpoint}\' npx playwright test tests/assets-transactions-evm.spec.ts --project=chromium --debug`
  // );

  return result?.includes('failed') ? 0 : 1;
}

module.exports = { run };
