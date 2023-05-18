/* eslint-disable @typescript-eslint/no-var-requires */
const startPlaywright = require('./start-playwright');
const setupPreconditions = require('./setup-preconditions-api');

// Define the parameters
const nodeName = 'astar';
const networkInfo = {
  nodesByName: {
    astar: { wsUri: 'ws://localhost:8000/' },
  },
};

// const args = process.env.BASE_URL || 'https://portal.astar.network/';
const args = 'http://localhost:8080/';

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
    const childProcess = spawnDetached(
      'npx @acala-network/chopsticks@latest xcm -p astar -p shiden'
    );
    console.log('Chopsticks started with pid:', childProcess.pid);

    result = await setupPreconditions.run(nodeName, networkInfo, ['Alice']);
    console.log('Setup Preconditions tests completed with result:', result);

    result = await startPlaywright.run(nodeName, networkInfo, [args]);
    console.log('Playwright tests completed with result:', result);

    process.kill(-childProcess.pid);
    console.log('Chopsticks stopped');
  } catch (error) {
    console.error('Error executing Playwright tests:', error);
  }
}

executeRun();
