import type { RegistryTypes } from '@polkadot/types/types';

/**
 * Type definition for Plasm Main Network
 */
const definitions: RegistryTypes = {
  AccountInfo: 'AccountInfoWithRefCount',
  AuthorityId: 'AccountId',
  AuthorityVote: 'u32',
  Claim: {
    amount: 'u128',
    approve: 'BTreeSet<AuthorityId>',
    complete: 'bool',
    decline: 'BTreeSet<AuthorityId>',
    params: 'Lockdrop',
  },
  ClaimId: 'H256',
  ClaimVote: {
    approve: 'bool',
    authority: 'u16',
    claim_id: 'ClaimId',
  },
  DollarRate: 'u128',
  Keys: 'SessionKeys2',
  Lockdrop: {
    duration: 'u64',
    public_key: '[u8; 33]',
    transaction_hash: 'H256',
    type: 'u8',
    value: 'u128',
  },
  PredicateHash: 'H256',
  RefCount: 'u8',
  TickerRate: {
    authority: 'u16',
    btc: 'u128',
    eth: 'u128',
  },
};

export default definitions;
