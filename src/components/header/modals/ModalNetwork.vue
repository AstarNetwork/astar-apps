<template>
  <ModalDrawer :is-show="isOpen" title="Network" :is-closing="isClosing" @close="closeModal">
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
                      v-if="selNetwork === index"
                      v-model="newEndpoint"
                      type="text"
                      placeholder="IP Address / Domain"
                      class="ip-input"
                    />
                  </div>
                  <div v-else-if="index === endpointKey.LOCAL">
                    <div />
                  </div>
                  <div v-else>
                    <div v-if="selNetwork === index" class="box--endpoints">
                      <div>
                        <span class="text--md">{{ $t('drawer.endpoint') }}</span>
                      </div>
                      <div class="column--options">
                        <div class="column--network-option">
                          <div class="box-input--endpoint">
                            <input
                              name="choose_endpoint"
                              type="radio"
                              :checked="selNetwork === index"
                              class="input--endpoint"
                              @change="selNetwork = index"
                            />
                          </div>
                          <span class="text--md">{{
                            $t('drawer.viaEndpoint', { value: 'Finality' })
                          }}</span>
                        </div>
                      </div>
                    </div>
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
  </ModalDrawer>
</template>
<script lang="ts">
import { useQuasar } from 'quasar';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { checkIsMobileMathWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import ModalDrawer from './ModalDrawer.vue';

export default defineComponent({
  components: {
    ModalDrawer,
  },
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

    const isClosing = ref<boolean>(false);

    const closeModal = (): void => {
      isClosing.value = true;
      const animationDuration = 500;
      setTimeout(() => {
        isClosing.value = false;
        emit('update:is-open', false);
      }, animationDuration);
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
      isClosing,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-network.scss';
</style>
