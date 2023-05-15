/* eslint-disable @typescript-eslint/no-var-requires */
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const util = require('@polkadot/util');
const TEST_DAPP_ADDRESS = '0x0000000000000000000000000000000000000001';

async function run(nodeName, networkInfo, args) {
  const BN = require('bn.js');
  const ONE = new BN(10).pow(new BN(18));

  const { sendTransaction } = await import('./tx-utils.mjs');
  const { wsUri, userDefinedTypes } = networkInfo.nodesByName[nodeName];
  const provider = new WsProvider(wsUri);
  const api = await ApiPromise.create({ provider });

  await api.isReady;

  // account to submit tx
  const keyring = new Keyring({ type: 'sr25519' });
  const sender = keyring.addFromUri('//' + args[0]);

  // create asset
  console.log('Creating asset with sender: ', sender.address);
  await sendTransaction(api.tx.assets.create(999, { Id: sender.address }, ONE), sender);
  console.log('Setting metadata with sender: ', sender.address);
  await sendTransaction(api.tx.assets.setMetadata(999, 'Test', 'TST', 18), sender);

  // register dApp
  const tx4 = api.tx.dappsStaking.register(sender.address, { Evm: TEST_DAPP_ADDRESS });
  await sendTransaction(api.tx.sudo.sudo(tx4), sender);

  const result = 1;
  return result;
}

module.exports = { run };