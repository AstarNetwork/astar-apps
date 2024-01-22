import { GeneralStakerInfo, getDappAddressEnum } from '@astar-network/astar-sdk-core';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { Option, u32 } from '@polkadot/types';
import { AccountLedger } from 'src/hooks';
import { ContractStakeInfo, FrameSystemAccountInfo } from 'src/v2/repositories/implementations';
import { sendTransaction } from './chopsticks/tx-utils';
import { KeyringPair } from '@polkadot/keyring/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { EraStakingPointsIndividualClaim } from 'src/store/dapp-staking/calculation';
import { RewardDestination } from 'src/v2/models';

export const NODE_ENDPOINT = process.env.ENDPOINT || 'ws://127.0.0.1:57083';
export let chainDecimals = 18;

export const getApi = async (): Promise<ApiPromise> => {
  const provider = new WsProvider(NODE_ENDPOINT);
  const apiPromise = new ApiPromise({ provider });

  const api = await apiPromise.isReady;
  chainDecimals = api.registry.chainDecimals[0];

  return api;
};

export const getAddress = (address: string) => {
  return { Evm: address };
};

export const getBalance = async (address: string, assetId?: string): Promise<bigint> => {
  const api = await getApi();
  let balance = BigInt(0);

  if (assetId) {
    const balanceObj = await api.query.assets.account(assetId, address);
    balance = BigInt(balanceObj.unwrap().balance.toBigInt());
  } else {
    const balanceObj = (await api.query.system.account(address)) as FrameSystemAccountInfo;
    balance = BigInt(balanceObj.data.free.toBigInt() - balanceObj.data.frozen.toBigInt());
  }

  return balance;
};

export const getStakedAmount = async (address: string): Promise<bigint> => {
  const api = await getApi();
  const era = await api.query.dappsStaking.currentEra();
  const eraStake = await api.query.dappsStaking.contractEraStake<Option<ContractStakeInfo>>(
    getAddress(address),
    era
  );

  return eraStake.isSome ? BigInt(eraStake.unwrap().total.toString()) : BigInt(0);
};

export const fetchAccountStakingAmount = async (
  currentAccount: string,
  dappAddress: string
): Promise<bigint> => {
  const api = await getApi();
  const stakerInfo = await api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
    currentAccount,
    getDappAddressEnum(dappAddress)
  );
  const balance = stakerInfo.stakes.length && stakerInfo.stakes.slice(-1)[0].staked.toString();

  return BigInt(balance);
};

export const fetchMinimumStakingAmount = async (): Promise<string> => {
  const api = await getApi();
  return String(api.consts.dappsStaking.minimumStakingAmount);
};

export const getAccountLedger = async (address: string): Promise<AccountLedger> => {
  const api = await getApi();
  const ledger = await api.query.dappsStaking.ledger<AccountLedger>(address);

  return ledger;
};

const getSigner = async (): Promise<KeyringPair> => {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: 'sr25519' });
  return keyring.addFromUri('//Alice');
};

export const forceNewEra = async (): Promise<void> => {
  const api = await getApi();
  const tx = api.tx.dappsStaking.forceNewEra();
  const sudo = await api.tx.sudo.sudo(tx);
  const signer = await getSigner();

  await sendTransaction(sudo, signer);
};

export const getContractEraStake = async (
  address: string,
  era: number
): Promise<EraStakingPointsIndividualClaim | undefined> => {
  const api = await getApi();
  const eraStake = await api.query.dappsStaking.contractEraStake<
    Option<EraStakingPointsIndividualClaim>
  >({ Evm: address }, era);

  return eraStake.unwrapOrDefault();
};

export const getCurrentEra = async (): Promise<number> => {
  const api = await getApi();
  return (await api.query.dappsStaking.currentEra<u32>()).toNumber();
};

export const forceUnbondingPeriod = async (): Promise<void> => {
  const api = await getApi();
  const unbondingPeriod = <u32>api.consts.dappsStaking.unbondingPeriod;
  const signer = await getSigner();

  for (let i = 0; i < unbondingPeriod.toNumber(); i++) {
    await sendTransaction(api.tx.sudo.sudo(api.tx.dappsStaking.forceNewEra()), signer);
  }
};

export const setRewardDestination = async (rewardDestination: RewardDestination): Promise<void> => {
  const api = await getApi();
  const signer = await getSigner();
  const tx = api.tx.dappsStaking.setRewardDestination(rewardDestination);
  await sendTransaction(tx, signer);
};

export const roundUpAndTruncateBigInt = async (
  bigIntValue: bigint,
  decimalPlaces: number
): Promise<bigint> => {
  const strValue = bigIntValue.toString();

  // Check if we have enough digits for rounding
  if (strValue.length <= decimalPlaces) {
    return bigIntValue;
  }

  const powerOf10 = BigInt('1' + '0'.repeat(decimalPlaces));

  // Determine the digit at the rounding position and round up if it's 5 or greater
  if (parseInt(strValue[strValue.length - decimalPlaces]) >= 5) {
    bigIntValue += powerOf10;
  }

  // Truncate the remaining digits by dividing by power of 10n
  return bigIntValue / powerOf10;
};

export const checkIsLightClient = (endpoint: string): boolean => endpoint.startsWith('light://');
