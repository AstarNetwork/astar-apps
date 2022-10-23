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
            <tr v-for="t in myStakeInfos" :key="t.address">
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
                    width="97"
                    height="24"
                    :disabled="false"
                    @click="navigateToStake(t.dappAddress)"
                    >{{ $t('myDapps.add') }}</astar-button
                  >
                  <astar-button width="97" height="24" :disabled="false" @click="showUnbound(t)">{{
                    $t('myDapps.unbond')
                  }}</astar-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <DropdownList :items="myStakeInfos" />
    </template>

    <Teleport to="#app--main">
      <div :class="'highest-z-index'">
        <ModalUnbondDapp
          v-model:is-open="showModalUnbond"
          :show="showModalUnbond"
          :dapp="selectedDapp"
        />
      </div>
    </Teleport>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { MyStakeInfo, useBreakpoints, useNetworkInfo, useStakerInfo } from 'src/hooks';
import DropdownList from './components/DropdownList.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import ModalUnbondDapp from './components/modals/ModalUnbondDapp.vue';
import { networkParam, Path } from 'src/router/routes';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';

export default defineComponent({
  components: { DropdownList, ModalUnbondDapp, TokenBalance },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { myStakeInfos } = useStakerInfo();
    const selectedDapp = ref<MyStakeInfo>();
    const router = useRouter();

    console.log('infos', myStakeInfos);

    //TODO: need refactor as module
    // const items = [
    //   {
    //     id: 0,
    //     name: 'Astar Degens',
    //     stakedAmount: 10000,
    //     totalEarned: 2000.12,
    //     isEnabled: true,
    //   },
    //   {
    //     id: 1,
    //     name: 'ArthSwap',
    //     stakedAmount: 10000,
    //     totalEarned: 2000.12,
    //     isEnabled: true,
    //   },
    //   {
    //     id: 2,
    //     name: 'Starlay Finance',
    //     stakedAmount: 10000,
    //     totalEarned: 2000.12,
    //     isEnabled: false,
    //   },
    // ];

    const showModalUnbond = ref<boolean>(false);

    const showUnbound = (dapp: MyStakeInfo): void => {
      console.log(dapp);
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
      myStakeInfos,
      selectedDapp,
      showUnbound,
      navigateToStake,
      ethers,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-dapps.scss';
</style>
