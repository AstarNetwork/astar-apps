/* eslint-disable @typescript-eslint/no-var-requires */
const startPlaywright = require('./start-playwright');
const setupPreconditions = require('./setup-preconditions-api');

// Define the parameters
const nodeName = process.argv[2] || 'astar';
const networkInfo = {
  nodesByName: {
    astar: { wsUri: 'ws://localhost:9944/' },
    shiden: { wsUri: 'ws://localhost:9961/' },
  },
};

const args = process.env.BASE_URL || 'https://portal.astar.network/';
// for debug
// const args = 'http://localhost:8080/';

const spawnDetached = (cmd) => {
  const cp = require('child_process').spawn(cmd, [], {
    detached: true,
    stdio: 'ignore',
    shell: true,
  });
  cp.unref();
  return cp;
};

// Execute the run function with the given parameters
async function executeRun() {
  try {
    const childProcess =
      nodeName === 'astar'
        ? spawnDetached(
            'npx @acala-network/chopsticks@latest xcm -p=tests/chopsticks/astar.yml -p=tests/chopsticks/moonbeam.yml -p=tests/chopsticks/acala.yml -p=tests/chopsticks/interlay.yml -p=tests/chopsticks/bifrost.yml -r=tests/chopsticks/polkadot.yml'
          )
        : spawnDetached(
            'npx @acala-network/chopsticks@latest xcm -p=tests/chopsticks/shiden.yml -p=tests/chopsticks/moonriver.yml -p=tests/chopsticks/karura.yml -p=tests/chopsticks/kintsugi.yml -r=tests/chopsticks/kusama.yml'
          );
    console.info('Chopsticks started with pid:', childProcess.pid);

    result = await setupPreconditions.run(nodeName, networkInfo, ['Alice', 'Bob']);
    console.info('Setup Preconditions tests completed with result:', result);

    result = await startPlaywright.run(nodeName, networkInfo, [args]);
    console.info('Playwright tests completed with result:', result);

    process.kill(-childProcess.pid);
    console.info('Chopsticks stopped');
  } catch (error) {
    console.error('Error executing Playwright tests:', error);
  }
  process.exit(0);
}

executeRun();
