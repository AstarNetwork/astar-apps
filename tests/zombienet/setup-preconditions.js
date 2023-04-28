const TEST_DAPP_ADDRESS = '0x0000000000000000000000000000000000000001';

async function run(nodeName, networkInfo, args) {
  const BN = require('bn.js');
  const ONE = new BN(10).pow(new BN(18));

  const { sendTransaction } = await import('./tx-utils.mjs');
  const { wsUri, userDefinedTypes } = networkInfo.nodesByName[nodeName];
  const api = await zombie.connect(wsUri, userDefinedTypes);

  await zombie.util.cryptoWaitReady();

  // account to submit tx
  const keyring = new zombie.Keyring({ type: 'sr25519' });
  const sender = keyring.addFromUri('//' + args[0]);

  // create asset
  const tx1 = api.tx.assets.create(999, { Id: sender.address }, ONE);
  const tx2 = api.tx.assets.setMetadata(999, 'Test', 'TST', 18);
  const tx3 = api.tx.assets.mint(999, { Id: sender.address }, ONE.muln(1000));
  // register dApp
  const tx4 = api.tx.dappsStaking.register(sender.address, { Evm: TEST_DAPP_ADDRESS });

  const batch = await api.tx.utility.batch([tx1, tx2, tx3, tx4]);
  await sendTransaction(api.tx.sudo.sudo(batch), sender);

  const result = 1;
  return result;
}

module.exports = { run };
