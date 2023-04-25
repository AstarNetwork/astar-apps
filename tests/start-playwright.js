const util = require('util');

async function run(nodeName, networkInfo, args) {
  console.log('Running playwright tests on node: ', nodeName, args);
  const endpoint = networkInfo.nodesByName[nodeName].wsUri;

  const exec = util.promisify(require('child_process').exec);
  // result =  await exec('npm install -D @playwright/test');
  // console.log('install:', result.stdout);
  const { stdout, stderr } = await exec(
    `BASE_URL=\'${args[0]}\' ENDPOINT=\'${endpoint}\'  npx playwright test --project=chromium`
  );

  console.log('output:', stdout);
  console.log('error:', stderr);

  // TODO check for errors
}

module.exports = { run };
