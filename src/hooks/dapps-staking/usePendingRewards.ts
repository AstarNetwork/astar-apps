import { truncate } from '@astar-network/astar-sdk-core';
import { ApiPromise } from '@polkadot/api';
import { Struct } from '@polkadot/types';
import { Perbill } from '@polkadot/types/interfaces';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models';
import { computed, watchEffect, Ref } from 'vue';
import { BN } from '@polkadot/util';

interface RewardDistributionConfig extends Struct {
  readonly baseTreasuryPercent: Perbill;
  readonly baseStakerPercent: Perbill;
  readonly dappsPercent: Perbill;
  readonly collatorsPercent: Perbill;
  readonly adjustablePercent: Perbill;
  readonly idealDappsStakingTvl: Perbill;
}

export const usePendingRewards = (unclaimedEra: Ref<number>) => {
  const store = useStore();
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const { currentAccount } = useAccount();

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

  const getPendingRewards = async (): Promise<number> => {
    const dappsRef = dapps.value;
    const apiRef = $api;
    const currentAccountRef = currentAccount.value;
    if (!apiRef || dappsRef.length === 0 || !currentAccountRef || !unclaimedEra.value) {
      return 0;
    }
    try {
      const results = await Promise.all([
        apiRef.consts.blockReward.rewardAmount.toString(),
        fetchRewardsDistributionConfig(apiRef),
        apiRef.query.balances.totalIssuance(),
        apiRef.query.dappsStaking.generalEraInfo.entries(),
        apiRef.consts.dappsStaking.blockPerEra,
        apiRef.query.dappsStaking.generalStakerInfo.entries(currentAccountRef),
      ]);

      const eraInfo = results[3];
      const blocksPerEra = Number(results[4]);
      const generalStakerInfo = results[5];

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

      // const totalStaked = eraTvls[eraTvls.length - 1].tvl;
      const currentEra = eraTvls[eraTvls.length - 1].era;

      const rawBlockRewards = results[0];
      const blockRewards = Number(ethers.utils.formatEther(rawBlockRewards));
      const eraRewards = blocksPerEra * blockRewards;

      interface StakerInfo {
        dappAddress: string;
        stakedTvl: number;
        era: number;
        pendingRewards: number;
        stakerRewardsPerEra: number;
        eraTvl: number;
        pendingRewardsBn: BN;
      }

      const stakerInfo: StakerInfo[] = [];

      const stakedEras: number[] = [];

      const generateEraRange = (era: number, currentEra: number): number[] => {
        const result = [];
        for (let i = era; i < currentEra; i++) {
          result.push(i);
        }
        return result;
      };

      console.log('eraTvls', eraTvls);

      generalStakerInfo.forEach(([key, value]) => {
        const k = key.toHuman() as any[];
        const v = value.toHuman() as { stakes: { staked: string; era: string }[] };
        console.log(v);
        const dappAddress = k[1].Evm;

        v.stakes.forEach((it) => {
          const stakedTvl = new BN(Number(ethers.utils.formatEther(it.staked.replace(/,/g, ''))));
          const era = Number(it.era.replace(/,/g, ''));
          const eraRange = generateEraRange(era, currentEra);
          // console.log('stakedTvl / eraTvl', stakedTvl / eraTvl);
          // const pendingRewards = (stakedTvl / eraTvl) * stakerRewardsPerEra;
          // console.log('pendingRewards', pendingRewards);
          if (era !== currentEra) {
            eraRange.forEach((e) => {
              const isPushed = stakerInfo.some(
                (it) => it.dappAddress === dappAddress && it.era === e
              );
              const eraTvl = eraTvls.find((it) => it.era === e)?.tvlStaked || 0;

              if (!isPushed) {
                stakerInfo.push({
                  dappAddress,
                  stakedTvl: stakedTvl.toNumber(),
                  era: e,
                  eraTvl,
                  stakerRewardsPerEra: 0,
                  pendingRewards: 0,
                  pendingRewardsBn: new BN(0),
                });
                stakedEras.push(e);
              }
            });
          }
        });
      });

      console.log('stakerInfo', stakerInfo);
      console.log('stakedEras', stakedEras);

      const eraTokenIssuances = await Promise.all(
        stakedEras.map(async (era) => {
          const blockHeight = await apiRef.query.system.number();
          const blockEraAgo = Number(blockHeight.toJSON()) - (currentEra - era) * blocksPerEra;
          const hash = await apiRef.rpc.chain.getBlockHash(blockEraAgo);
          const block = await apiRef.at(hash);
          const eraIssuance = await block.query.balances.totalIssuance();
          const formattedIssuance = Number(ethers.utils.formatEther(eraIssuance.toString()));
          return { era, eraTokenIssuance: formattedIssuance };
        })
      );

      console.log('eraTokenIssuances', eraTokenIssuances);

      const pendingRewards = stakerInfo.map((it) => {
        // const totalStaked = eraTvls[it.era].tvl;
        const totalStaked = eraTvls[it.era].tvlLocked;
        const { baseStakerPercent, adjustablePercent, idealDappsStakingTvl } = results[1];
        const totalIssuance =
          eraTokenIssuances.find((that) => it.era === that.era)?.eraTokenIssuance || 0;
        const tvlPercentage = totalStaked / totalIssuance;
        console.log('totalStaked', totalStaked);
        console.log('totalIssuance', totalIssuance);
        const adjustableStakerPercentage =
          Math.min(1, tvlPercentage / idealDappsStakingTvl) * adjustablePercent;
        // console.log('tvlPercentage', tvlPercentage);
        // console.log('idealDappsStakingTvl', idealDappsStakingTvl);
        console.log('adjustablePercent', adjustablePercent);

        const stakerBlockReward = adjustableStakerPercentage + baseStakerPercent;
        // console.log('adjustableStakerPercentage', adjustableStakerPercentage);
        // console.log('baseStakerPercent', baseStakerPercent);

        // const stakerBlockReward = 0.538494865780933;
        const stakerRewardsPerEra = eraRewards * stakerBlockReward;
        // console.log('eraRewards', eraRewards);
        // console.log('stakerBlockReward', stakerBlockReward);
        // console.log('stakerRewardsPerEra', stakerRewardsPerEra);
        const pendingRewards = (it.stakedTvl / it.eraTvl) * stakerRewardsPerEra;
        // console.log('it.stakedTvl', it.stakedTvl);
        // console.log('it.eraTvl', it.eraTvl);

        // RewardsPerEra * staker's percentage
        // const eraRewards = 1822176 * 0.538494865780933 // 981232.42054924
        // 0.5265407512723972

        // User's TVL (Era: 337) / TVL .staked
        // 658068.626449004181879454/3137916084.265 = 0.00020972
        // User's % * eraRewardsForStaker
        // 0.00020972 * 981232.42054924 = 205.78406324

        // 4393.973794866108/15028243.426426124 = 0.0002923811
        // 0.0002923811 * 6622.482354092249 = 1.9362886754
        // 1.93628868

        // 658068/3138065994.452513191078838437 = 0.0002097
        // 0.0002097 * 959084.6868892835=201.12005884

        console.log('pendingRewards', pendingRewards);

        return {
          ...it,
          stakerRewardsPerEra,
          pendingRewards,
          pendingRewardsBn: new BN(0),
        };
      });

      let ttlPendingRewards = 0;
      pendingRewards.forEach((it) => {
        ttlPendingRewards = ttlPendingRewards + it.pendingRewards;
      });
      // pendingRewards.forEach((it) => {
      //   ttlPendingRewards = ttlPendingRewards.addn(it.pendingRewards);
      // });
      console.log('stakerInfo', stakerInfo);
      console.log('ttlPendingRewards', ttlPendingRewards);
      // console.log('ttlPendingRewards ', ttlPendingRewards.toNumber());
      console.log('ttlPendingRewards truncate', truncate(ttlPendingRewards));
      return 0;
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  watchEffect(async () => {
    await getPendingRewards();
  });
  return {};
};
