<template>
  <div>
    <div
      class="
        sm:tw-flex
        tw-items-end tw-border-b tw-border-gray-300
        dark:tw-border-darkGray-600
        tw-mb-8
        tw-mx--4
        sm:tw--mx-8
        tw-px-4
        sm:tw-px-8
      "
    >
      <h1
        class="
          md:tw-mr-10
          tw-text-3xl tw-font-extrabold tw-text-blue-900
          dark:tw-text-white
          tw-mb-6
          sm:tw-mb-8
          tw-whitespace-nowrap
        "
      >
        {{ $t('dappStaking.dappStaking') }}
      </h1>
      <button @click="callTest">Test</button>
      <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
        <div class="tw-flex">
          <Tab :labels="[{ label: 'Discover', path: 'discover' }]" />
          <!-- <Tab :labels="[{ label: 'Manage', path: 'manage-dapps' }]" /> -->
        </div>
        <div
          class="
            tw-hidden
            lg:tw-block
            tw-ml-4
            2xl:tw-text-lg
            tw-font-semibold tw-text-blue-900
            dark:tw-text-white
          "
        >
          {{
            $t('dappStaking.warning', {
              amount: minimumStakingAmount,
              stakers: maxNumberOfStakersPerContract.toLocaleString('en-US'),
            })
          }}
        </div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { formatUnitAmount } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { computed, defineComponent, watchEffect } from 'vue';
import Tab from 'components/common/Tab.vue';
import { useAccount, useStakingH160 } from 'src/hooks';
import BN from 'bn.js';
export default defineComponent({
  components: { Tab },
  setup() {
    const store = useStore();
    const maxNumberOfStakersPerContract = computed(
      () => store.getters['dapps/getMaxNumberOfStakersPerContract']
    );
    const minimumStakingAmount = computed(() => {
      const amount = store.getters['dapps/getMinimumStakingAmount'];
      return formatUnitAmount(amount);
    });

    // for testing
    const { currentAccount } = useAccount();
    const {
      getEraInfo,
      getEraRewardsAndStakes,
      getStakedAmount,
      getContractStake,
      callRegister,
      callBondAndStake,
      callUnbondAndUnstake,
      callWithdrawUnbonded,
      callClaim,
    } = useStakingH160(currentAccount);
    // const { result } = getEraInfo();
    // const { result } = getEraRewardsAndStakes(633);
    // const { result } = getStakedAmount('0x1CdEBe3d073CE76615Ed3f9FaB9F4A886BE62f27');
    // const { result } = getContractStake('0x03B233193E1F59edbDb154a9f59347dD40584F5a'); // decus

    // watchEffect(() => {
    //   if (result.value) {
    //     console.log('result', result.value);
    //   }
    // });

    const callTest = async () => {
      // const result = await callRegister('0x1CdEBe3d073CE76615Ed3f9FaB9F4A886BE62f27');
      const result = await callBondAndStake(
        '0xDE0f34d2845511c20bAb0d7ce02B03c8065ff0c5',
        new BN(10).pow(new BN(19))
      );
      // const result = await callUnbondAndUnstake('0x1CdEBe3d073CE76615Ed3f9FaB9F4A886BE62f27', 10 ** 19);
      // const result = await callWithdrawUnbonded();
      // const result = await callClaim('0x1CdEBe3d073CE76615Ed3f9FaB9F4A886BE62f27', 1);
      console.log('result', result);
    };

    return {
      maxNumberOfStakersPerContract,
      minimumStakingAmount,
      callTest,
    };
  },
});
</script>
