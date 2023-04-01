import { ApiPromise } from '@polkadot/api';
import { Struct } from '@polkadot/types';
import { Perbill } from '@polkadot/types/interfaces';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { useAccount } from 'src/hooks';
import { Ref, ref, watchEffect } from 'vue';

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
  stakerRewardsPerEra?: number;
  pendingRewards?: number;
}

export const usePendingRewards = (unclaimedEra: Ref<number>) => {
  const { currentAccount } = useAccount();
  const pendingRewards = ref<number>(0);

  const fetchRewardsDistributionConfig = async (
    api: ApiPromise
  ): Promise<{
    baseStakerPercent: number;
    adjustablePercent: number;
    idealDappsStakingTvl: number;
  }> => {
    const result =
      await api.query.blockReward.rewardDistributionConfigStorage<RewardDistributionConfig>();
    const numAdjToPercentage = 0.000000001;
    const baseStakerPercent = result.baseStakerPercent.toNumber() * numAdjToPercentage;
    const adjustablePercent = result.adjustablePercent.toNumber() * numAdjToPercentage;
    const idealDappsStakingTvl = result.idealDappsStakingTvl.toNumber() * numAdjToPercentage;
    return { baseStakerPercent, adjustablePercent, idealDappsStakingTvl };
  };

  const generateEraRange = (era: number, currentEra: number): number[] => {
    const result = [];
    for (let i = era; i < currentEra; i++) {
      result.push(i);
    }
    return result;
  };

  const getPendingRewards = async (): Promise<number> => {
    const apiRef = $api;
    if (!apiRef || !currentAccount.value || !unclaimedEra.value) return 0;
    try {
      const stakerInfo: StakerInfo[] = [];
      const stakedEras: number[] = [];
      const eraTokenIssuances: { era: number; eraTokenIssuance: number }[] = [];

      const [
        rawBlockRewards,
        rewardsDistributionConfig,
        eraInfo,
        rawBlockPerEra,
        generalStakerInfo,
        blockHeight,
      ] = await Promise.all([
        apiRef.consts.blockReward.rewardAmount.toString(),
        fetchRewardsDistributionConfig(apiRef),
        apiRef.query.dappsStaking.generalEraInfo.entries(),
        apiRef.consts.dappsStaking.blockPerEra,
        apiRef.query.dappsStaking.generalStakerInfo.entries(currentAccount.value),
        apiRef.query.system.number(),
      ]);

      const eraTvls = eraInfo
        .map(([key, value]) => {
          const era = key.toHuman() as string[];
          const v = value.toHuman() as { staked: string; locked: string };
          const tvl = v.staked.replace(/,/g, '');
          const tvlLocked = v.locked.replace(/,/g, '');
          return {
            era: Number(era[0].replace(/,/g, '')),
            tvlStaked: Number(ethers.utils.formatEther(tvl)),
            tvlLocked: Number(ethers.utils.formatEther(tvlLocked)),
          };
        })
        .sort((a, b) => a.era - b.era);

      const currentEra = eraTvls[eraTvls.length - 1].era;
      const blockRewards = Number(ethers.utils.formatEther(rawBlockRewards));
      const blocksPerEra = Number(rawBlockPerEra);
      const eraRewards = blocksPerEra * blockRewards;

      generalStakerInfo.forEach(([key, value]) => {
        const k = key.toHuman() as any[];
        const v = value.toHuman() as { stakes: { staked: string; era: string }[] };
        const dappAddress = k[1].Evm;

        v.stakes.forEach((it) => {
          const stakedTvl = Number(ethers.utils.formatEther(it.staked.replace(/,/g, '')));
          const era = Number(it.era.replace(/,/g, ''));
          const eraRange = generateEraRange(era, currentEra);
          if (era === currentEra) return;

          eraRange.forEach((e) => {
            const isPushed = stakerInfo.some(
              (it) => it.dappAddress === dappAddress && it.era === e
            );
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

      const block7EraAgo = Number(blockHeight.toJSON()) - blocksPerEra * 7;
      const [hash, currentIssuance] = await Promise.all([
        apiRef.rpc.chain.getBlockHash(block7EraAgo > 0 ? block7EraAgo : 1),
        apiRef.query.balances.totalIssuance(),
      ]);
      const block = await apiRef.at(hash);
      const sevenEraAgoIssuance = await block.query.balances.totalIssuance();
      const formattedCurrentIssuance = Number(ethers.utils.formatEther(currentIssuance.toString()));
      const formattedSevenEraAgoIssuance = Number(
        ethers.utils.formatEther(sevenEraAgoIssuance.toString())
      );
      const issueAmountSevenEra = formattedCurrentIssuance - formattedSevenEraAgoIssuance;
      const issueAmountOneEra = Number((issueAmountSevenEra / 7).toFixed());

      for await (const era of stakedEras) {
        if (block7EraAgo > 0) {
          const eraDifferent = currentEra - era;
          const eraTokenIssuance = formattedCurrentIssuance - issueAmountOneEra * eraDifferent;
          eraTokenIssuances.push({ era, eraTokenIssuance });
        } else {
          // When: fallback for localnode
          const blockEraAgo = Number(blockHeight.toJSON()) - (currentEra - era) * blocksPerEra;
          const hash = await apiRef.rpc.chain.getBlockHash(blockEraAgo);
          const block = await apiRef.at(hash);
          const eraIssuance = await block.query.balances.totalIssuance();
          const formattedIssuance = Number(ethers.utils.formatEther(eraIssuance.toString()));
          eraTokenIssuances.push({ era, eraTokenIssuance: formattedIssuance });
        }
      }

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
          stakerRewardsPerEra,
          pendingRewards,
        };
      });

      const ttlPendingRewards = pendingRewards.reduce((acc, it) => acc + it.pendingRewards, 0);
      return ttlPendingRewards;
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  watchEffect(async () => {
    pendingRewards.value = await getPendingRewards();
  });
  return { pendingRewards };
};
