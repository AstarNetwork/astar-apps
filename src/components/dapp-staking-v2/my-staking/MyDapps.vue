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
                    <astar-button
                      width="97"
                      height="24"
                      :disabled="false"
                      @click="showUnbound(t)"
                      >{{ $t('myDapps.unbond') }}</astar-button
                    >
                  </div>
                </td>
              </tr>
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
import { defineComponent, ref, PropType } from 'vue';
import { MyStakeInfo, useBreakpoints, useNetworkInfo } from 'src/hooks';
import DropdownList from './components/DropdownList.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import ModalUnbondDapp from './components/modals/ModalUnbondDapp.vue';
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
    const selectedDapp = ref<MyStakeInfo>();
    const router = useRouter();

    const showModalUnbond = ref<boolean>(false);

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
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-dapps.scss';
</style>
