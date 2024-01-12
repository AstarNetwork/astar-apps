// Local dApp staking v3 environment setup script.
// Before running this script, make sure you have a local node with dApp staking v3 pallet running.

// Init
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

const wsProvider = new WsProvider('ws://127.0.0.1:9944');
const api = await ApiPromise.create({ provider: wsProvider });

const keyring = new Keyring({ type: 'sr25519' });
const alice = keyring.addFromUri('//Alice', { name: 'Alice' });
const bob = keyring.addFromUri('//Bob', { name: 'Bob' });
const charlie = keyring.addFromUri('//Charlie', { name: 'Charlie' });

// Register dApps
const calls = [
  api.tx.dappStaking.register(alice.address, { Evm: '0x0000000000000000000000000000000000000005' }),
  api.tx.dappStaking.register(alice.address, { Evm: '0x0000000000000000000000000000000000000006' }),
  api.tx.dappStaking.register(charlie.address, {
    Evm: '0x0000000000000000000000000000000000000007',
  }),
];

const batch = api.tx.utility.batch(calls);
const sudo = api.tx.sudo.sudo(batch);

const promiseToRegisterDapps = new Promise(async (resolve, reject) => {
  try {
    await sudo.signAndSend(alice, (result) => {
      console.log(result.status.toHuman());
      if (result.status.isFinalized) {
        resolve(true);
      }
    });
  } catch {
    reject(false);
  }
});

const dappsRegistered = await promiseToRegisterDapps;
if (dappsRegistered) {
  // Send some test tokens
  api.tx.balances
    .transfer('XmSTidw9qbJJdC4ntotpzwCkR7iAgkMUnLv6rg29Qa3aoQa', BigInt('1000000000000000000000'))
    .signAndSend(alice, (result) => {
      console.log(result.status.toHuman());
    });
}
