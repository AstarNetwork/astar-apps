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
          Wasm: 'AccountId',
          Evm: 'H160',
      },
    },
    EraIndex: 'u32',
    EraStakingPoints: {
      total: 'Balance',
      stakers: 'BTreeMap<AccountId, Balance>'
    }
};

export default definitions;