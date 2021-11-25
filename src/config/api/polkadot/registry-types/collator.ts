import type { RegistryTypes } from '@polkadot/types/types';

const definitions: RegistryTypes = {
  Address: 'MultiAddress',
  LookupSource: 'MultiAddress',
  ChainId: {
    _enum: {
      RelayChain: null,
      Parachain: 'ParaId',
    },
  },
  XCurrencyId: {
    chain_id: 'ChainId',
    currency_id: 'Bytes',
  },
  CurrencyIdOf: 'CurrencyId',
  CurrencyId: {
    _enum: {
      Token: 'TokenSymbol',
    },
  },
  TokenSymbol: {
    _enum: ['ACA', 'AUSD', 'DOT', 'XBTC', 'LDOT', 'RENBTC', 'SDN', 'PLM'],
  },
  AmountOf: 'Amount',
  Amount: 'i128',
  SmartContract: {
    _enum: {
      Evm: 'H160',
      Wasm: 'AccountId',
    },
  },
  EraIndex: 'u32',
  EraRewardAndStake: {
    rewards: 'Balance',
    staked: 'Balance',
  },
  PalletDappsStakingEraRewardAndStake: {
    rewards: 'Balance',
    staked: 'Balance',
  },
  EraStakingPoints: {
    total: 'Balance',
    stakers: 'BTreeMap<AccountId, Balance>',
    formerStakedEra: 'EraIndex',
    claimedRewards: 'Balance',
  },
  PalletDappsStakingEraStakingPoints: {
    total: 'Balance',
    stakers: 'BTreeMap<AccountId, Balance>',
    formerStakedEra: 'EraIndex',
    claimedRewards: 'Balance',
  },
};

export default definitions;
