<template>
  <div class="panel--item">
    <table>
      <thead>
        <tr>
          <th>{{ $t('myDapps.stakedAmount') }}</th>
          <!-- <th>{{ $t('myDapps.totalEarned') }}</th> -->
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <token-balance
              :balance="ethers.utils.formatEther(item.yourStake.denomAmount.toString())"
              :symbol="nativeTokenSymbol"
              :decimals="0"
            />
          </td>
          <!-- <td>{{ item.totalEarned.toLocaleString() }} ASTR</td> -->
        </tr>
      </tbody>
    </table>
    <div class="row--manage">
      <astar-button
        :width="97"
        :height="24"
        :disabled="isUnregistered(item)"
        @click="navigateToStake(item.dappAddress)"
        >{{ $t('myDapps.add') }}</astar-button
      >
      <astar-button
        :width="97"
        :height="24"
        :disabled="isUnregistered(item)"
        @click="showUnbound(item)"
        >{{ $t('myDapps.unbond') }}</astar-button
      >
    </div>
    <div v-if="isUnregistered(item)" class="badge--unregistered">
      <q-icon name="warning" size="20px" class="q-mx-lg" />
      <div>
        <div>{{ $t('myDapps.unregisteredAlert') }}</div>
        <button class="btn--claim-unbond" :disabled="!canClaim" @click="claimAll">
          {{ $t('myDapps.claimAndUnbond') }}
        </button>
      </div>
    </div>
    <Teleport to="#app--main">
      <div :class="'highest-z-index'">
        <modal-unbond-dapp
          v-model:is-open="showModalUnbond"
          :show="showModalUnbond"
          :dapp="selectedDapp"
        />
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import ModalUnbondDapp from '../components/modals/ModalUnbondDapp.vue';
import { MyStakeInfo, useNetworkInfo, useClaimAll } from 'src/hooks';
import { networkParam, Path } from 'src/router/routes';
import { ethers } from 'ethers';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: { TokenBalance, ModalUnbondDapp },
  props: {
    item: {
      type: Object as PropType<MyStakeInfo>,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { claimAll, canClaim } = useClaimAll();
    const selectedDapp = ref<MyStakeInfo>();
    const router = useRouter();

    const showModalUnbond = ref<boolean>(false);
    const isUnregistered = (info: MyStakeInfo): boolean =>
      !info.isRegistered && info.stakersCount > 0;

    const showUnbound = (dapp: MyStakeInfo): void => {
      selectedDapp.value = dapp;
      showModalUnbond.value = true;
    };

    const navigateToStake = (address: string | undefined): void => {
      const base = networkParam + Path.DappStaking + Path.Stake;
      const url = `${base}?dapp=${address?.toLowerCase()}`;
      router.push(url);
    };

    return {
      nativeTokenSymbol,
      showModalUnbond,
      selectedDapp,
      showUnbound,
      navigateToStake,
      ethers,
      claimAll,
      canClaim,
      isUnregistered,
    };
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/dropdown-item.scss';
</style>
