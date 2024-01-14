import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { XcmChain } from 'src/v2/models/XcmModels';
import { TokensAccounts } from 'src/v2/repositories/implementations/xcm/AcalaXcmRepository';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';

const BNC = { Native: 'BNC' };
const vDOT = { VToken2: 0 };
const vKSM = { VToken: 'KSM' };
const ASTR = { Token2: 3 };
const vASTR = { vToken2: 3 };
const SDN = { Token2: 3 };

/**
 * Used to transfer assets from Bifrost
 */
export class BifrostXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);
    super(defaultApi, apiFactory, registeredTokens);
    this.astarTokens = {
      ASTR: 3,
    };
  }

  public async getTransferCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN,
    endpoint: string
  ): Promise<ExtrinsicPayload> {
    if (!to.parachainId) {
      throw `Parachain id for ${to.name} is not defined`;
    }
    let tokenData;
    if (token.originAssetId == 'BNC') {
      tokenData = BNC;
    } else if (token.originAssetId == 'vDOT') {
      tokenData = vDOT;
    } else if (token.originAssetId == 'vKSM') {
      tokenData = vKSM;
    } else if (token.originAssetId == 'ASTR') {
      tokenData = ASTR;
    } else if (token.originAssetId == 'vASTR') {
      tokenData = vASTR;
    } else if (token.originAssetId == 'SDN') {
      tokenData = SDN;
    } else {
      throw `Token name for ${token.originAssetId} is not defined`;
    }

    const version = 'V3';

    const AccountId32 = {
      id: decodeAddress(recipientAddress),
    };

    const destination = {
      [version]: {
        parents: '1',
        interior: {
          X2: [
            {
              Parachain: to.parachainId,
            },
            {
              AccountId32,
            },
          ],
        },
      },
    };
    const destWeight = {
      // limited: new BN(10).pow(new BN(9)).muln(5),
      Unlimited: null,
    };

    return await this.buildTxCall(
      from,
      endpoint,
      'xTokens',
      'transfer',
      tokenData,
      amount,
      destination,
      destWeight
    );
  }

  public async getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean,
    endpoint: string
  ): Promise<string> {
    const api = await this.apiFactory.get(endpoint);
    try {
      if (token.originAssetId == 'BNC') {
        return (await this.getNativeBalance(address, chain, endpoint)).toString();
      } else if (token.originAssetId == 'vDOT') {
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, vDOT);
        return bal.free.toString();
      } else if (token.originAssetId == 'vKSM') {
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, vKSM);
        return bal.free.toString();
      } else if (token.originAssetId == 'ASTR') {
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, ASTR);
        return bal.free.toString();
      } else if (token.originAssetId == 'vASTR') {
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, vASTR);
        return bal.free.toString();
      } else if (token.originAssetId == 'SDN') {
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, SDN);
        return bal.free.toString();
      } else {
        return '0';
      }
    } catch (e) {
      console.error(e);
      return '0';
    }
  }
}
