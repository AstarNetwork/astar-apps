<template>
  <div @click="setShowRestakeModal(true)">
    <slot>
      <astar-button :disabled="amountToClaim <= 0" :width="width" :height="height">
        {{ $t('stakingV3.claim') }}
      </astar-button>
    </slot>
    <Teleport to="#app--main">
      <modal-restake
        :show="showRestakeModal"
        :set-is-open="setShowRestakeModal"
        :rewards="amountToClaim"
        :on-confirm="handleRestakeConfirm"
      />
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import ModalRestake from './vote/re-stake/ModalRestake.vue';
import { useDappStaking, useVote, useDapps } from '../hooks';
import { ClaimType, type SingularStakingInfo } from '../logic';

export default defineComponent({
  components: {
    ModalRestake,
  },
  props: {
    claimType: {
      type: Number,
      required: false,
      default: ClaimType.Staker,
    },
    width: {
      type: Number,
      required: false,
      default: 100,
    },
    height: {
      type: Number,
      required: false,
      default: 32,
    },
  },
  setup(props) {
    const {
      totalStakerRewards,
      rewards,
      stakerInfo,
      claimStakerRewards,
      claimBonusRewards,
      claimStakerAndBonusRewards,
    } = useDappStaking();
    const { vote, canRestake } = useVote(ref([]));
    const { getDapp } = useDapps();
    const showRestakeModal = ref<boolean>(false);

    // Staker info containing registered dApps only.
    // Rewards can't be re-staked for unregistered dApps.
    const stakerInfoRegisteredDapps =
      computed<Map<string, SingularStakingInfo>>(() => {
        const result = new Map<string, SingularStakingInfo>();

        stakerInfo.value.forEach((value, key) => {
          const dapp = getDapp(key);
          if (dapp) {
            result.set(key, value);
          }
        });

        return result;
      });

    const amountToClaim = computed<bigint>(() => {
      if (props.claimType === ClaimType.Staker) {
        return rewards.value.staker.amount;
      }

      if (props.claimType === ClaimType.Bonus) {
        return rewards.value.bonus;
      }

      return totalStakerRewards.value;
    });

    const setShowRestakeModal = async (value: boolean) => {
      // Idea is to restake proportionally to already staked dApps.
      // At the beginning of a period all stakes are reset so user will be able to claim rewards only.
      if (value && (stakerInfoRegisteredDapps.value.size === 0 || !canRestake())) {
        await handleRestakeConfirm(false);
      } else {
        showRestakeModal.value = value;
      }
    };

    const handleRestakeConfirm = async (restake: boolean): Promise<void> => {
      if (restake && stakerInfoRegisteredDapps.value.size > 0) {
        await vote(restake);
      } else {
        if (props.claimType === ClaimType.Staker) {
          await claimStakerRewards();
        } else if (props.claimType === ClaimType.Bonus) {
          await claimBonusRewards();
        } else {
          await claimStakerAndBonusRewards();
        }
      }
    };

    return {
      showRestakeModal,
      amountToClaim,
      setShowRestakeModal,
      handleRestakeConfirm,
    };
  },
});
</script>
