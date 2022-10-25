import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';
import { XcmChain } from 'src/v2/models/XcmModels';
import { Struct } from '@polkadot/types';

export interface TokensAccounts extends Struct {
    readonly free: BN;
    readonly reserved: BN;
    readonly frozen: BN;
}

/**
 * Used to transfer assets from Darwinia/Crab
 */
export class DarwiniaXcmRepository extends XcmRepository {
    constructor() {
        const defaultApi = container.get<IApi>(Symbols.DefaultApi);
        const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
        const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);

        super(defaultApi, apiFactory, registeredTokens);
    }

    public async getTransferCall(
        from: XcmChain,
        to: XcmChain,
        recipientAddress: string,
        token: Asset,
        amount: BN
    ): Promise<ExtrinsicPayload> {
        if (!to.parachainId) {
            throw `Parachain id for ${to.name} is not defined`;
        }
        const assets = {
            V1: [
                {
                    fun: {
                        Fungible: amount,
                    },
                    id: {
                        Concrete: {
                            interior: {
                                X1: {
                                        PalletInstance: new BN(5),
                                    },
                            },
                            parents: new BN(0),
                        },
                    },
                },
            ],
        };

        const dest = {
            V1: {
                parents: new BN(1),
                interior: {
                    X1: {
                        Parachain: new BN(to.parachainId),
                    },
                },
            },
        };

        const beneficiary = {
            V1: {
                parents: new BN(0),
                interior: {
                    X1: {
                        AccountId32: {
                            network: {
                                Any: null,
                            },
                            id: decodeAddress(recipientAddress),
                        },
                    },
                }
            }
        }

        return await this.buildTxCall(
            from,
            'polkadotXcm',
            'reserveTransfer',
            dest,
            beneficiary,
            assets,
            new BN(0)
        );
    }

    public async getTokenBalance(
        address: string,
        chain: XcmChain,
        token: Asset,
        isNativeToken: boolean
    ): Promise<string> {
        try {
            return (await this.getNativeBalance(address, chain)).toString();
        } catch (e) {
            console.error(e);
            return '0';
        }
    }
}
