<template>
  <div>
    <template v-if="width >= screenSize.lg">
      <div class="table-container">
        <table id="my-table">
          <thead>
            <tr>
              <th>{{ $t('myDapps.dapps') }}</th>
              <th>{{ $t('myDapps.stakedAmount') }}</th>
              <!-- <th>{{ $t('myDapps.totalEarned') }}</th> -->
              <th class="title--manage">{{ $t('myDapps.manage') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="myStakeInfos && myStakeInfos.length > 0">
              <!-- eslint-disable-next-line vue/no-v-for-template-key -->
              <template v-for="t in myStakeInfos" :key="t.address">
                <tr>
                  <td>{{ t.name }}</td>
                  <td>
                    <token-balance
                      :balance="ethers.utils.formatEther(t.yourStake.denomAmount.toString())"
                      :symbol="nativeTokenSymbol"
                      :decimals="0"
                    />
                  </td>
                  <td>
                    <div class="row--manage">
                      <astar-button
                        :width="97"
                        :height="24"
                        :disabled="isUnregistered(t)"
                        @click="navigateToStake(t.dappAddress)"
                        >{{ $t('myDapps.add') }}</astar-button
                      >
                      <astar-button
                        :width="97"
                        :height="24"
                        :disabled="isUnregistered(t)"
                        @click="showUnbound(t)"
                        >{{ $t('myDapps.unbond') }}</astar-button
                      >
                    </div>
                  </td>
                </tr>
                <tr v-if="isUnregistered(t)">
                  <td colspan="3">
                    <div class="badge--unregistered">
                      <q-icon name="warning" size="20px" class="q-mr-sm" />
                      {{ $t('myDapps.unregisteredAlert') }}
                      <button class="btn--claim-unbond" :disabled="!canClaim" @click="claimAll">
                        {{ $t('myDapps.claimAndUnbond') }}
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            <!-- Todo: update the skelton animation later -->
            <template v-else>
              <tr v-for="n in 3" :key="n">
                <td class="text-left">
                  <q-skeleton animation="blink" type="text" width="85px" />
                </td>
                <td class="text-left">
                  <q-skeleton animation="blink" type="text" width="85px" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <dropdown-list :items="myStakeInfos" />
    </template>

    <modal-unbond-dapp
      v-model:is-open="showModalUnbond"
      :show="showModalUnbond"
      :dapp="selectedDapp"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { MyStakeInfo, useBreakpoints, useNetworkInfo, useClaimAll } from 'src/hooks';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import DropdownList from 'src/components/dapp-staking-v2/my-staking/components/DropdownList.vue';
import ModalUnbondDapp from 'src/components/dapp-staking-v2/my-staking/components/modals/ModalUnbondDapp.vue';
import { networkParam, Path } from 'src/router/routes';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';

export default defineComponent({
  components: { DropdownList, ModalUnbondDapp, TokenBalance },
  props: {
    myStakeInfos: {
      type: Object as PropType<MyStakeInfo[] | undefined>,
      required: true,
    },
  },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { claimAll, canClaim } = useClaimAll();
    const selectedDapp = ref<MyStakeInfo>();
    const router = useRouter();

    const showModalUnbond = ref<boolean>(false);
    const isUnregistered = (info: MyStakeInfo): boolean => {
      return !info.isRegistered && info.stakersCount > 0;
    };

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
      width,
      screenSize,
      nativeTokenSymbol,
      showModalUnbond,
      selectedDapp,
      showUnbound,
      navigateToStake,
      ethers,
      canClaim,
      claimAll,
      isUnregistered,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-dapps.scss';
</style>
