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
  console.log('Creating asset with sender: ', sender.address);
  await sendTransaction(api.tx.assets.create(999, { Id: sender.address }, ONE), sender);
  console.log('Setting metadata with sender: ', sender.address);
  await sendTransaction(api.tx.assets.setMetadata(999, 'Test', 'TST', 18), sender);
  // console.log('Minting asset with sender: ', sender.address)
  // await sendTransaction(api.tx.assets.mint(999, { Id: sender.address }, ONE.muln(1000)), sender);
  // const tx1 = api.tx.assets.forceCreate(999, { Id: sender.address }, true, ONE);
  // //const tx1a = api.tx.assets.forceCreate(998, { Id: sender.address }, true, ONE);
  // //const batch1 = await api.tx.utility.batchAll([tx1, tx1a]);
  // await sendTransaction(api.tx.sudo.sudo(tx1), sender);

  // const tx2 = api.tx.assets.setMetadata(999, 'Test', 'TST', 18);
  // await sendTransaction(api.tx.sudo.sudo(tx2), sender);
  // const tx3 = api.tx.assets.mint(999, { Id: sender.address }, ONE.muln(1000));
  // await sendTransaction(api.tx.sudo.sudo(tx3), sender);
  //const tx2a = api.tx.assets.setMetadata(998, 'Test1', 'TST1', 18);
  //const tx3a = api.tx.assets.mint(998, { Id: sender.address }, ONE.muln(1000));
  // register dApp
  const tx4 = api.tx.dappsStaking.register(sender.address, { Evm: TEST_DAPP_ADDRESS });
  await sendTransaction(api.tx.sudo.sudo(tx4), sender);


  // const batch = await api.tx.utility.batchAll([tx2, tx3, tx2a, tx3a]);
  // await sendTransaction(api.tx.sudo.sudo(batch), sender);

  const result = 1;
  return result;
}

module.exports = { run };
