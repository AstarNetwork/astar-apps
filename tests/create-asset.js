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

  console.log('Creating asset with sender: ', sender.address);
  await sendTransaction(api.tx.assets.create(999, { Id: sender.address }, ONE), sender);
  
  console.log('Setting metadata with sender: ', sender.address);
  await sendTransaction(api.tx.assets.setMetadata(999, 'Test', 'TST', 18), sender);

  console.log('Minting asset with sender: ', sender.address)
  await sendTransaction(api.tx.assets.mint(999, { Id: sender.address }, ONE.muln(1000)), sender);

  const result = 1;
  return result;
}

module.exports = { run };
