// Todo: move this file to Astar.js

import { StorageKey, Struct } from '@polkadot/types';
import { Perbill } from '@polkadot/types/interfaces';
import { ApiPromise } from '@polkadot/api';
import { ethers } from 'ethers';
import { Codec } from '@polkadot/types/types';

interface RewardDistributionConfig extends Struct {
  readonly baseTreasuryPercent: Perbill;
  readonly baseStakerPercent: Perbill;
  readonly dappsPercent: Perbill;
  readonly collatorsPercent: Perbill;
  readonly adjustablePercent: Perbill;
  readonly idealDappsStakingTvl: Perbill;
}

interface StakerInfo {
  dappAddress: string;
  stakedTvl: number;
  era: number;
  eraTvl: number;
  pendingRewards?: number;
}

interface EraTvl {
  era: number;
  tvlStaked: number;
  tvlLocked: number;
}

interface EraTokenIssuances {
  era: number;
  eraTokenIssuance: number;
}

interface DistributionConfig {
  baseStakerPercent: number;
  adjustablePercent: number;
  idealDappsStakingTvl: number;
}

export const removeKSeparator = (wei: string): string => {
  return wei.replace(/,/g, '');
};

export const fmtAmtFromKSeparator = (wei: string): number => {
  return Number(ethers.utils.formatEther(removeKSeparator(wei)));
};

const formatEraTvls = (eraInfo: [StorageKey<any>, Codec][]): EraTvl[] => {
  return eraInfo
    .map(([key, value]) => {
      const era = key.toHuman() as string[];
      const v = value.toHuman() as { staked: string; locked: string };
      const tvl = removeKSeparator(v.staked);
      const tvlLocked = removeKSeparator(v.locked);
      return {
        era: Number(removeKSeparator(era[0])),
        tvlStaked: fmtAmtFromKSeparator(tvl),
        tvlLocked: fmtAmtFromKSeparator(tvlLocked),
      };
    })
    .sort((a, b) => a.era - b.era);
};

// Params: era: 332, currentEra: 339
// Returns:  [332, 333, 334, 335, 336, 337, 338]
const generateEraRange = (era: number, currentEra: number): number[] => {
  const result = [];
  for (let i = era; i < currentEra; i++) {
    result.push(i);
  }
  return result;
};

const formatGeneralStakerInfo = ({
  eraTvls,
  currentEra,
  generalStakerInfo,
}: {
  currentEra: number;
  eraTvls: EraTvl[];
  generalStakerInfo: [StorageKey<any>, Codec][];
}): { stakerInfo: StakerInfo[]; stakedEras: number[] } => {
  const stakerInfo: StakerInfo[] = [];
  const stakedEras: number[] = [];

  generalStakerInfo.forEach(([key, value]) => {
    const k = key.toHuman() as any[];
    const v = value.toHuman() as { stakes: { staked: string; era: string }[] };
    const dappAddress = k[1].Evm;

    v.stakes.forEach((it) => {
      const stakedTvl = fmtAmtFromKSeparator(it.staked);
      const era = Number(removeKSeparator(it.era));
      const eraRange = generateEraRange(era, currentEra);
      if (era === currentEra) return;

      eraRange.forEach((e) => {
        const isPushed = stakerInfo.some((it) => it.dappAddress === dappAddress && it.era === e);
        if (isPushed) return;

        const eraTvl = eraTvls.find((it) => it.era === e)?.tvlStaked || 0;
        stakerInfo.push({
          dappAddress,
          stakedTvl,
          era: e,
          eraTvl,
        });
        stakedEras.push(e);
      });
    });
  });
  return { stakerInfo, stakedEras };
};

const fetchRewardsDistributionConfig = async (api: ApiPromise): Promise<DistributionConfig> => {
  const result =
    await api.query.blockReward.rewardDistributionConfigStorage<RewardDistributionConfig>();
  const numAdjToPercentage = 0.000000001;
  const baseStakerPercent = result.baseStakerPercent.toNumber() * numAdjToPercentage;
  const adjustablePercent = result.adjustablePercent.toNumber() * numAdjToPercentage;
  const idealDappsStakingTvl = result.idealDappsStakingTvl.toNumber() * numAdjToPercentage;
  return { baseStakerPercent, adjustablePercent, idealDappsStakingTvl };
};

const estimateEraTokenIssuances = async ({
  blockHeight,
  api,
  stakedEras,
  currentEra,
  blocksPerEra,
}: {
  blockHeight: number;
  api: ApiPromise;
  stakedEras: number[];
  currentEra: number;
  blocksPerEra: number;
}): Promise<EraTokenIssuances[]> => {
  const eraTokenIssuances: { era: number; eraTokenIssuance: number }[] = [];
  const block7EraAgo = blockHeight - blocksPerEra * 7;
  const [hash, currentIssuance] = await Promise.all([
    api.rpc.chain.getBlockHash(block7EraAgo > 0 ? block7EraAgo : 1),
    api.query.balances.totalIssuance(),
  ]);
  const block = await api.at(hash);
  const sevenEraAgoIssuance = await block.query.balances.totalIssuance();
  const formattedCurrentIssuance = Number(ethers.utils.formatEther(currentIssuance.toString()));
  const formattedSevenEraAgoIssuance = Number(
    ethers.utils.formatEther(sevenEraAgoIssuance.toString())
  );
  const issueAmountSevenEra = formattedCurrentIssuance - formattedSevenEraAgoIssuance;
  const issueAmountOneEra = Number((issueAmountSevenEra / 7).toFixed());

  for await (const era of stakedEras) {
    if (block7EraAgo > 0) {
      // Memo: avoid calling API too much (`else` code is calling API too often but more accurate)
      const eraDifferent = currentEra - era;
      const eraTokenIssuance = formattedCurrentIssuance - issueAmountOneEra * eraDifferent;
      eraTokenIssuances.push({ era, eraTokenIssuance });
    } else {
      // When: fallback for localnode
      const blockEraAgo = blockHeight - (currentEra - era) * blocksPerEra;
      const hash = await api.rpc.chain.getBlockHash(blockEraAgo);
      const block = await api.at(hash);
      const eraIssuance = await block.query.balances.totalIssuance();
      const formattedIssuance = Number(ethers.utils.formatEther(eraIssuance.toString()));
      eraTokenIssuances.push({ era, eraTokenIssuance: formattedIssuance });
    }
  }
  return eraTokenIssuances;
};

const formatStakerPendingRewards = ({
  stakerInfo,
  eraTvls,
  eraTokenIssuances,
  eraRewards,
  rewardsDistributionConfig,
}: {
  stakerInfo: StakerInfo[];
  eraTvls: EraTvl[];
  eraTokenIssuances: EraTokenIssuances[];
  eraRewards: number;
  rewardsDistributionConfig: DistributionConfig;
}) => {
  const pendingRewards = stakerInfo.map((it) => {
    const totalStaked = eraTvls[it.era].tvlLocked;
    const { baseStakerPercent, adjustablePercent, idealDappsStakingTvl } =
      rewardsDistributionConfig;
    const totalIssuance =
      eraTokenIssuances.find((that) => it.era === that.era)?.eraTokenIssuance || 0;
    const tvlPercentage = totalStaked / totalIssuance;
    const adjustableStakerPercentage =
      Math.min(1, tvlPercentage / idealDappsStakingTvl) * adjustablePercent;

    const stakerBlockReward = adjustableStakerPercentage + baseStakerPercent;
    const stakerRewardsPerEra = eraRewards * stakerBlockReward;
    const pendingRewards = (it.stakedTvl / it.eraTvl) * stakerRewardsPerEra;

    return {
      ...it,
      pendingRewards,
    };
  });
  return pendingRewards;
};

export const getPendingRewards = async ({
  api,
  currentAccount,
}: {
  api: ApiPromise;
  currentAccount: string;
}): Promise<{ stakerPendingRewards: number }> => {
  try {
    const [
      rawBlockRewards,
      rewardsDistributionConfig,
      eraInfo,
      rawBlockPerEra,
      generalStakerInfo,
      blockHeight,
    ] = await Promise.all([
      api.consts.blockReward.rewardAmount.toString(),
      fetchRewardsDistributionConfig(api),
      api.query.dappsStaking.generalEraInfo.entries(),
      api.consts.dappsStaking.blockPerEra,
      api.query.dappsStaking.generalStakerInfo.entries(currentAccount),
      api.query.system.number(),
    ]);

    const eraTvls = formatEraTvls(eraInfo);
    const currentEra = eraTvls[eraTvls.length - 1].era;
    const blockRewards = Number(ethers.utils.formatEther(rawBlockRewards));
    const blocksPerEra = Number(rawBlockPerEra);
    const eraRewards = blocksPerEra * blockRewards;

    const { stakerInfo, stakedEras } = formatGeneralStakerInfo({
      eraTvls,
      currentEra,
      generalStakerInfo,
    });

    const eraTokenIssuances = await estimateEraTokenIssuances({
      blockHeight: Number(blockHeight.toJSON()),
      api,
      stakedEras,
      currentEra,
      blocksPerEra,
    });

    const stakerPendingRewards = formatStakerPendingRewards({
      stakerInfo,
      eraTvls,
      eraTokenIssuances,
      eraRewards,
      rewardsDistributionConfig,
    });

    const amtStakerPendingRewards = stakerPendingRewards.reduce(
      (acc, it) => acc + it.pendingRewards,
      0
    );

    return { stakerPendingRewards: amtStakerPendingRewards };
  } catch (error) {
    console.error(error);
    return { stakerPendingRewards: 0 };
  }
};
