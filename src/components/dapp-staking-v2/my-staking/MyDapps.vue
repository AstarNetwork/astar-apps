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
                    @click="showModalAdd = true"
                    >{{ $t('myDapps.add') }}</astar-button
                  >
                  <astar-button
                    width="97"
                    height="24"
                    :disabled="false"
                    @click="showModalUnbond = true"
                    >{{ $t('myDapps.unbond') }}</astar-button
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <DropdownList :items="items" />
    </template>

    <Teleport to="#app--main">
      <div :class="'highest-z-index'">
        <ModalAddStake v-model:is-open="showModalAdd" :show="showModalAdd" />
        <ModalUnbondDapp v-model:is-open="showModalUnbond" :show="showModalUnbond" />
      </div>
    </Teleport>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useBreakpoints, useNetworkInfo, useStakerInfo } from 'src/hooks';
import DropdownList from './components/DropdownList.vue';
import ModalAddStake from './components/modals/ModalAddStake.vue';
import ModalUnbondDapp from './components/modals/ModalUnbondDapp.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { ethers } from 'ethers';

export default defineComponent({
  components: { DropdownList, ModalAddStake, ModalUnbondDapp, TokenBalance },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { myStakeInfos } = useStakerInfo();

    //TODO: need refactor as module
    const items = [
      {
        id: 0,
        name: 'Astar Degens',
        stakedAmount: 10000,
        totalEarned: 2000.12,
        isEnabled: true,
      },
      {
        id: 1,
        name: 'ArthSwap',
        stakedAmount: 10000,
        totalEarned: 2000.12,
        isEnabled: true,
      },
      {
        id: 2,
        name: 'Starlay Finance',
        stakedAmount: 10000,
        totalEarned: 2000.12,
        isEnabled: false,
      },
    ];

    const showModalAdd = ref(false);
    const showModalUnbond = ref(false);

    return {
      width,
      screenSize,
      items,
      nativeTokenSymbol,
      showModalAdd,
      showModalUnbond,
      myStakeInfos,
      ethers,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-dapps.scss';
</style>
