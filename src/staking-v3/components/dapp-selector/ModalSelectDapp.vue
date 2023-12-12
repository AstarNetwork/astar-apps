<template>
  <modal-wrapper
    :is-modal-open="isModalSelectDapp"
    :title="$t('stakingV3.selectProjects')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="select-dapp-modal"
  >
    <div class="wrapper--dapps">
      <div class="search">
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="$t('stakingV3.search')"
          @change="$event.target"
        />
      </div>
      <div
        v-for="dapp in filteredDapps"
        :key="dapp.address"
        class="dapp"
        :class="isSelected(dapp) && 'selected--dapp'"
        @click="handleDappSelected(dapp)"
      >
        <img :src="dapp.logoUrl" :alt="dapp.name" class="dapp--logo" />
        <div>{{ dapp.name }}</div>
        <div v-if="isSelected(dapp)" class="selection--order">
          {{ getDappSelectionNumber(dapp) }}
        </div>
      </div>
      <astar-button
        :disabled="selectedDapps.length === 0"
        class="button--primary"
        @click="handleDone()"
        >{{ $t('stakingV3.done') }}</astar-button
      >
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { wait } from 'src/v2/common';
import { Dapp } from './Model';

export default defineComponent({
  components: {
    ModalWrapper,
  },
  props: {
    dapps: {
      type: Object as PropType<Dapp[]>,
      required: true,
    },
    isModalSelectDapp: {
      type: Boolean,
      required: true,
    },
    handleModalSelectDapp: {
      type: Function as PropType<(isOpen: { isOpen: boolean }) => void>,
      required: true,
    },
    dappsSelected: {
      type: Function as PropType<(dapp: Dapp[]) => void>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const maxDappsToSelect = 10;
    const isClosingModal = ref<boolean>(false);
    const selectedDapps = ref<Dapp[]>([]);
    const searchTerm = ref<string>('');
    const filteredDapps = computed<Dapp[]>(() =>
      props.dapps.filter(
        (dapp) =>
          dapp.name.toLowerCase().includes(searchTerm.value.toLowerCase()) || isSelected(dapp)
      )
    );

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalSelectDapp({ isOpen: false });
      isClosingModal.value = false;
    };

    const handleDappSelected = (dapp: Dapp): void => {
      const indexToRemove = selectedDapps.value.indexOf(dapp);
      if (indexToRemove >= 0) {
        selectedDapps.value.splice(indexToRemove, 1);
      } else {
        if (selectedDapps.value.length < maxDappsToSelect) {
          selectedDapps.value.push(dapp);
        }
      }
    };

    const handleDone = (): void => {
      if (props.dappsSelected) {
        props.dappsSelected(selectedDapps.value);
      }

      closeModal();
    };

    const getDappSelectionNumber = (dapp: Dapp): number | undefined => {
      const number = selectedDapps.value.indexOf(dapp) + 1;

      return number === 0 ? undefined : number;
    };

    const isSelected = (dapp: Dapp): boolean => selectedDapps.value.includes(dapp);

    return {
      closeModal,
      handleDappSelected,
      handleDone,
      getDappSelectionNumber,
      isSelected,
      selectedDapps,
      isClosingModal,
      searchTerm,
      filteredDapps,
    };
  },
});
</script>

<style lang="scss" scoped>
.wrapper--dapps {
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.dapp--logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 16px;
}

.dapp {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  margin: 8px 0;
  cursor: pointer;
  border: 1px solid transparent;
}

.selected--dapp {
  border: 1px solid $astar-blue;
}

.selection--order {
  margin-left: auto;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  background-color: $astar-blue;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: $white;
  justify-content: center;
  align-items: center;
  display: flex;
}

.button--primary {
  width: 100%;
  height: 52px;
  margin-top: 24px;
}

.search {
  border-radius: 6px;
  border: 1px solid $navy-1;
  padding: 16px;
  margin-bottom: 24px;
  input {
    outline: none;
    width: 100%;
  }
}

.body--dark {
  .search {
    border-color: $gray-1;
    input {
      background-color: $navy-1;
    }
  }
  //   .selection--order {
  //   background-color: $$astar-blue
  // }
}
</style>
