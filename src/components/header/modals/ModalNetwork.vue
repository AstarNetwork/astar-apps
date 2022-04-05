<template>
  <astar-simple-modal :show="isOpen" title="Network" @close="closeModal">
    <div class="wrapper--modal-network">
      <div class="wrapper--select-network">
        <fieldset>
          <ul role="radiogroup">
            <li v-for="(provider, index) in providerEndpoints" :key="index">
              <label
                :class="[
                  'class-radio',
                  selNetwork === index ? 'class-radio-on' : 'class-radio-off',
                  provider.key === endpointKey.CUSTOM &&
                    isCustomNetwork &&
                    'class-radio--custom-network',
                ]"
              >
                <input
                  name="choose_networks"
                  type="radio"
                  :checked="selNetwork === index"
                  class="ip--network"
                  @change="selNetwork = index"
                />
                <div class="wrapper--network-detail">
                  <div class="box--radio-network">
                    <img v-if="provider.defaultLogo" width="24" :src="provider.defaultLogo" />
                    <p class="box--display-name">
                      {{ provider.displayName }}
                    </p>
                  </div>
                  <div v-if="index === endpointKey.CUSTOM">
                    <input
                      v-if="isCustomNetwork"
                      v-model="newEndpoint"
                      type="text"
                      placeholder="IP Address / Domain"
                      class="ip-input"
                    />
                  </div>
                </div>
              </label>
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
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { checkIsMobileMathWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';

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
    const classRadioOff = 'class-radio-off';

    const $q = useQuasar();
    const isAndroid = $q.platform.is.android;
    const store = useStore();
    const newEndpoint = ref('');
    const customEndpoint = computed(() => store.getters['general/customEndpoint']);
    newEndpoint.value = customEndpoint.value;

    const closeModal = (): void => {
      emit('update:is-open', false);
    };

    const { NETWORK_IDX, CUSTOM_ENDPOINT } = LOCAL_STORAGE;

    const selectNetwork = async (networkIdx: number): Promise<void> => {
      localStorage.setItem(NETWORK_IDX, networkIdx.toString());
      if (newEndpoint.value) {
        let endpoint = `${newEndpoint.value}`;
        endpoint = !endpoint.includes('wss://') ? `wss://${endpoint}` : endpoint;
        localStorage.setItem(CUSTOM_ENDPOINT, endpoint);
      }

      if (isAndroid && (await checkIsMobileMathWallet())) {
        window.open(window.location.origin);
      } else {
        location.reload();
      }

      emit('update:is-open', false);
      emit('update:select-network', networkIdx);
    };

    const selNetwork = ref(props.networkIdx);
    const isDisabled = computed(() => {
      return selNetwork.value === endpointKey.CUSTOM && !newEndpoint.value;
    });

    const isCustomNetwork = computed(() => selNetwork.value === endpointKey.CUSTOM);

    return {
      closeModal,
      newEndpoint,
      selectNetwork,
      selNetwork,
      classRadioOn,
      classRadioOff,
      providerEndpoints,
      endpointKey,
      isDisabled,
      isCustomNetwork,
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
  border: 1px solid $astar-blue;
}
.class-radio-on {
  border: 2px solid $astar-blue;
}

.ip--network {
  width: rem(16);
  height: rem(16);
  background: #fff;
  appearance: none;
  margin-right: rem(12);
  border-radius: 9999px;
  border-width: 1px;

  &:checked {
    background: $astar-blue;
    border-width: 3px;
  }
}

.wrapper--network-detail {
  flex: 1 1 0%;
  text-align: left;

  .box--radio-network {
    display: flex;
    padding-left: rem(8);
    align-items: center;
  }
  .box--display-name {
    margin-left: rem(8);
  }
}

.class-radio--custom-network {
  height: 120px;
  background: #fff !important;
}

.ip-input {
  width: 236px;
  height: 48px;
  text-align: center;
  margin-top: 16px;
  margin-left: 8px;
  border-radius: 6px;
  background-color: $gray-1;
  border: 1px solid $gray-1;
  padding: 0 16px;
  text-align: left;
  font-weight: 400;
  font-size: 14px;
  color: $gray-5;
}

.ip-input:focus {
  outline: none;
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
    background: $gray-5-selected-dark;
  }
  .class-radio--custom-network {
    background: $gray-6 !important;
  }

  .ip--network {
    background: $gray-6;
    border: 1px solid $gray-3;

    &:checked {
      background: $astar-blue;
      border-width: 3px;
    }
  }

  .ip-input {
    background: $gray-5-selected-dark;
    border: 1px solid $gray-4;
    color: $gray-1;
  }
}
</style>
