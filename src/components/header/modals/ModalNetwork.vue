<template>
  <astar-simple-modal :show="isOpen" title="Network" @close="closeModal">
    <div class="wrapper--modal-network">
      <div class="wrapper--select-network">
        <div class="row--separator--account">
          <div class="border--separator--account" />
        </div>
        <fieldset>
          <ul role="radiogroup">
            <li v-for="(provider, index) in providerEndpoints" :key="index" class="tw-mb-2">
              <label
                :class="[
                  'class-radio',
                  selNetwork === index ? 'class-radio-on' : 'class-radio-off',
                ]"
              >
                <input
                  name="choose_networks"
                  type="radio"
                  :checked="selNetwork === index"
                  class="
                    ip--network
                    tw-appearance-none
                    tw-border-2
                    tw-border-gray-100
                    tw-rounded-full
                    tw-h-4
                    tw-w-4
                    tw-mr-3
                    focus:tw-outline-none
                    tw-bg-white
                    checked:tw-border-4
                  "
                  @change="selNetwork = index"
                />
                <div class="tw-text-left tw-flex-1">
                  <div class="tw-flex tw-pl-2 tw-items-center">
                    <img
                      v-if="provider.defaultLogo"
                      class="tw-mr-2"
                      width="24"
                      :src="provider.defaultLogo"
                    />
                    <p :class="selNetwork === index ? 'class-radio-txt-on' : 'class-radio-txt-off'">
                      {{ provider.displayName }}
                    </p>
                  </div>
                </div>
              </label>
              <!-- custom endpoint -->
              <input
                v-if="provider.key === endpointKey.CUSTOM && selNetwork === endpointKey.CUSTOM"
                v-model="newEndpoint"
                type="text"
                placeholder="IP Address / Domain"
                class="ip-input"
              />
            </li>
          </ul>
        </fieldset>
      </div>
      <div class="wrapper__row--button">
        <button
          class="btn btn--connect"
          :disabled="isDisabled"
          @click="selectNetwork(selNetwork, newEndpoint)"
        >
          {{ $t('connect') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export default defineComponent({
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    networkIdx: {
      type: Number,
      required: true,
    },
  },
  emits: ['update:select-network', 'update:is-open'],
  setup(props, { emit }) {
    const classRadioOn = 'class-radio-on';
    // 'tw-rounded-lg tw-border tw-border-blue-500 tw-bg-blue-200 dark:tw-bg-blue-500 tw-bg-opacity-10 tw-px-4 tw-py-5 tw-flex tw-items-center tw-cursor-pointer';
    const classRadioOff = 'class-radio-off';
    const classRadioTxtOn = 'class-radio-txt-on';
    // const classRadioTxtOn = 'tw-font-medium tw-text-blue-500 dark:tw-text-blue-400 tw-text-sm';
    const classRadioTxtOff = 'class-radio-tx-off';

    const store = useStore();
    const newEndpoint = ref('');
    const customEndpoint = computed(() => store.getters['general/customEndpoint']);
    newEndpoint.value = customEndpoint.value;

    const closeModal = (): void => {
      // props.handleModalNetwork({ isOpen: false });
      emit('update:is-open', false);
    };

    const { NETWORK_IDX, CUSTOM_ENDPOINT } = LOCAL_STORAGE;

    const selectNetwork = (networkIdx: number): void => {
      localStorage.setItem(NETWORK_IDX, networkIdx.toString());
      if (newEndpoint.value) {
        let endpoint = `${newEndpoint.value}`;
        endpoint = !endpoint.includes('wss://') ? `wss://${endpoint}` : endpoint;
        localStorage.setItem(CUSTOM_ENDPOINT, endpoint);
      }
      location.reload();

      emit('update:is-open', false);
      emit('update:select-network', networkIdx);
    };

    const selNetwork = ref(props.networkIdx);
    const isDisabled = computed(() => {
      return selNetwork.value === endpointKey.CUSTOM && !newEndpoint.value;
    });

    return {
      closeModal,
      newEndpoint,
      selectNetwork,
      selNetwork,
      classRadioOn,
      classRadioOff,
      classRadioTxtOn,
      classRadioTxtOff,
      providerEndpoints,
      endpointKey,
      isDisabled,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.wrapper--modal-network {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 20px;
}

.class-radio {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  height: rem(56);
  width: rem(314);
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: $gray-5;
  margin: 0 auto;
  margin-top: 16px;
  padding: 16px;
  cursor: pointer;
}
.class-radio-off {
  background: #fff;
  border: 1px solid transparent;
}
.class-radio-off:hover {
  border: 1px solid $astar-blue-dark;
}
.class-radio-on {
  border: 2px solid $astar-blue-dark;
}

.ip--network {
  background: #fff;

  &:checked {
    background: $astar-blue;
  }
}

.ip-input {
  width: 330px;
  text-align: center;
  @apply tw-flex tw-appearance-none tw-bg-gray-50 dark:tw-bg-darkGray-800 tw-block tw-mx-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-rounded-md tw-mt-2 tw-px-5 tw-py-2 tw-text-sm tw-text-gray-700 dark:tw-text-darkGray-100  tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600;
}
.ip-input:focus {
  @apply tw-outline-none tw-bg-white dark:tw-bg-darkGray-900 tw-ring-blue-500 tw-border-blue-500;
}

.wrapper__row--button {
  display: flex;
  justify-content: center;
}

.btn--connect {
  width: 340px;
  background-color: $astar-blue;
  font-size: 20px;
  font-weight: 600;
  border-radius: 30px;
  height: 52px;
  margin-top: 24px;
  &:hover {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)),
      linear-gradient(0deg, $astar-blue, $astar-blue);
  }
}

.body--dark {
  .class-radio {
    color: #fff;
  }
  .class-radio-off {
    background: $gray-6;
  }

  .class-radio-on {
    background: $gray-5-selected;
  }
}
</style>
