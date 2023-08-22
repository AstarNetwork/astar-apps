/* eslint-disable @typescript-eslint/no-var-requires */
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const TEST_DAPP_ADDRESS = '0x0000000000000000000000000000000000000001';
const TEST_DAPP_ADDRESS_2 = '0x0000000000000000000000000000000000000002';

async function run(nodeName, networkInfo, args) {
  const BN = require('bn.js');
  const ONE = new BN(10).pow(new BN(18));

  const { sendTransaction } = await import('./tx-utils.mjs');
  const { wsUri } = networkInfo.nodesByName[nodeName];
  const provider = new WsProvider(wsUri);
  const api = await ApiPromise.create({ provider });
  await api.isReady;

  // account to submit tx
  const keyring = new Keyring({ type: 'sr25519' });
  const sender = keyring.addFromUri('//' + args[0]);
  const bob = keyring.addFromUri('//' + args[1]);

  // create asset
  console.info('Creating asset with sender: ', sender.address);
  await sendTransaction(api.tx.assets.create(999, { Id: sender.address }, ONE), sender);
  console.info('Setting metadata with sender: ', sender.address);
  await sendTransaction(api.tx.assets.setMetadata(999, 'Test', 'TST', 18), sender);

  // register dApp
  console.info('Registering dApps with sender: ', sender.address);
  const tx4 = api.tx.dappsStaking.register(sender.address, { Evm: TEST_DAPP_ADDRESS });
  const tx5 = api.tx.dappsStaking.register(bob.address, { Evm: TEST_DAPP_ADDRESS_2 });
  await sendTransaction(api.tx.sudo.sudo(tx4), sender);
  await sendTransaction(api.tx.sudo.sudo(tx5), sender);

  const result = 1;
  return result;
}

module.exports = { run };
