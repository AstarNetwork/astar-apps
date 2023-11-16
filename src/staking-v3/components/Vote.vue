<template>
  <div class="wrapper--vote">
    <div class="title">{{ $t('stakingV3.voteTitle') }}</div>
    <div class="note">
      <b>{{ $t('toast.note') }}</b>
      <ul>
        <li>
          {{
            $t('stakingV3.minimumStakingAmount', {
              amount: constants?.minStakeAmountToken,
              symbol: nativeTokenSymbol,
            })
          }}
        </li>
        <li>
          {{
            $t('stakingV3.minBalanceAfterStaking', {
              amount: constants?.minBalanceAfterStaking,
              symbol: nativeTokenSymbol,
            })
          }}
        </li>
      </ul>
    </div>
    <div>
      <div class="dapp">
        <dapp-selector
          :dapps="dapps"
          :dapp-selected="handleDappSelected"
          :placeholder="$t('stakingV3.chooseProject')"
        />
      </div>
      <div class="amount">
        <amount />
      </div>
    </div>
    <div class="note">
      <b>{{ $t('stakingV3.availableToVote') }}</b>
      <div class="note--row">
        <div>{{ $t('stakingV3.totalTransferable') }}</div>
        <div><format-balance :balance="useableBalance" /></div>
      </div>
      <div class="note--row">
        <div>{{ $t('stakingV3.lockedForVoting') }}</div>
        <div><format-balance :balance="locked" /></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useDappStaking, useDapps } from '../hooks';
import { useAccount, useBalance, useNetworkInfo } from 'src/hooks';
import { DappSelector, Dapp } from './dapp-selector';
import Amount from './Amount.vue';
import FormatBalance from 'src/components/common/FormatBalance.vue';

export default defineComponent({
  components: {
    DappSelector,
    Amount,
    FormatBalance,
  },
  setup() {
    const { constants, ledger } = useDappStaking();
    const { registeredDapps } = useDapps();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { currentAccount } = useAccount();
    const { useableBalance } = useBalance(currentAccount);
    const locked = computed<string>(() => ledger?.value?.locked.toString() ?? '0');

    const selectedDapp = ref<Dapp | undefined>(undefined);

    const dapps = computed<Dapp[]>(() => {
      return registeredDapps.value.map((dapp) => ({
        name: dapp.basic.name,
        address: dapp.basic.address,
        logoUrl: dapp.basic.iconUrl,
      }));
    });

    const handleDappSelected = (dapp: Dapp): void => {
      selectedDapp.value = dapp;
    };

    return { constants, nativeTokenSymbol, dapps, locked, useableBalance, handleDappSelected };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

ul {
  margin: 0 8px;
  padding-left: 24px;
}

li {
  list-style-type: disc;
}

.wrapper--vote {
  padding: 16px;
}

.title {
  color: $navy-1;
  font-size: 32px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
  letter-spacing: -0.64px;
}

.note {
  padding: 16px;
  gap: 8px;
  align-self: stretch;
  border-radius: 16px;
  background-color: $gray-1;
  margin: 16px 0;
}

.note--row {
  display: flex;
  justify-content: space-between;
}

.dapp {
  border-radius: 16px 16px 0px 0px;
  border: 1px solid $gray-3;
  border-bottom-width: 0px;
  padding: 24px 8px;
}

.amount {
  border-radius: 0px 0px 16px 16px;
  border: 1px solid $gray-3;
  border-top-width: 0px;
  padding: 24px 8px;
}

.body--dark {
  .title {
    color: $gray-1;
  }

  .note {
    background-color: $navy-3;
  }
}
</style>
