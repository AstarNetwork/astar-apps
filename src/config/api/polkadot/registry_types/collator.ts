import type { RegistryTypes } from '@polkadot/types/types';

const definitions: RegistryTypes = {
    Address: 'AccountId',
    LookupSource: 'AccountId',
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
};

export default definitions;