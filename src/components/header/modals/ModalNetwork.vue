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
                    <div
                      v-if="selNetwork === index && providerEndpoints[index].endpoints"
                      class="box--endpoints"
                    >
                      <div>
                        <span class="text--md">{{ $t('drawer.endpoint') }}</span>
                      </div>
                      <div class="column--options">
                        <div
                          v-for="(endpointObj, i) in providerEndpoints[index].endpoints"
                          :key="i"
                        >
                          <div
                            class="column--network-option"
                            @click="setSelEndpoint({ endpointObj, networkIdx: index })"
                          >
                            <div class="box-input--endpoint">
                              <input
                                name="choose_endpoint"
                                type="radio"
                                :checked="
                                  checkIsCheckedEndpoint({ index, endpoint: endpointObj.endpoint })
                                "
                                class="input--endpoint"
                              />
                            </div>
                            <span class="text--md">{{
                              $t('drawer.viaEndpoint', { value: endpointObj.name })
                            }}</span>
                          </div>
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
import { $endpoint } from 'src/boot/api';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getRandomFromArray } from 'src/hooks/helper/common';
import { checkIsMobileMathWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch } from 'vue';
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

    const { NETWORK_IDX, CUSTOM_ENDPOINT, SELECTED_ENDPOINT } = LOCAL_STORAGE;

    const getSelectedNetwork = (networkIdx: number): string => {
      switch (networkIdx) {
        case endpointKey.ASTAR:
          return selEndpointAstar.value;
        case endpointKey.SHIDEN:
          return selEndpointShiden.value;
        case endpointKey.SHIBUYA:
          return selEndpointShibuya.value;

        default:
          return selEndpointAstar.value;
      }
    };

    const selectNetwork = async (networkIdx: number): Promise<void> => {
      localStorage.setItem(NETWORK_IDX, networkIdx.toString());
      localStorage.setItem(
        SELECTED_ENDPOINT,
        JSON.stringify({
          [networkIdx]: getSelectedNetwork(networkIdx),
        })
      );
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

    const selNetwork = ref<number>(props.networkIdx);
    const selEndpointAstar = ref<string>('');
    const selEndpointShiden = ref<string>('');
    const selEndpointShibuya = ref<string>('');

    const isDisabled = computed(() => {
      return selNetwork.value === endpointKey.CUSTOM && !newEndpoint.value;
    });

    const isCustomNetwork = computed(() => selNetwork.value === endpointKey.CUSTOM);

    const checkIsCheckedEndpoint = ({
      index,
      endpoint,
    }: {
      index: number;
      endpoint: string;
    }): boolean => {
      return index === endpointKey.ASTAR
        ? selEndpointAstar.value === endpoint
        : index === endpointKey.SHIDEN
        ? selEndpointShiden.value === endpoint
        : selEndpointShibuya.value === endpoint;
    };

    const setSelEndpoint = ({
      endpointObj,
      networkIdx,
    }: {
      endpointObj: { name: string; endpoint: string };
      networkIdx: number;
      selEndpointRef: string;
    }): void => {
      localStorage.setItem(
        SELECTED_ENDPOINT,
        JSON.stringify({
          [networkIdx]: endpointObj.endpoint,
        })
      );
      if (networkIdx === endpointKey.ASTAR) {
        selEndpointAstar.value = endpointObj.endpoint;
      } else if (networkIdx === endpointKey.SHIDEN) {
        selEndpointShiden.value = endpointObj.endpoint;
      } else if (networkIdx === endpointKey.SHIBUYA) {
        selEndpointShibuya.value = endpointObj.endpoint;
      }
    };

    const randomizedEndpoint = (networkIdx: number) => {
      if (networkIdx === endpointKey.ASTAR) {
        selEndpointAstar.value = getRandomFromArray(
          providerEndpoints[endpointKey.ASTAR].endpoints
        ).endpoint;
      }
      if (networkIdx === endpointKey.SHIDEN) {
        selEndpointShiden.value = getRandomFromArray(
          providerEndpoints[endpointKey.SHIDEN].endpoints
        ).endpoint;
      }
      if (networkIdx === endpointKey.SHIBUYA) {
        selEndpointShibuya.value = getRandomFromArray(
          providerEndpoints[endpointKey.SHIBUYA].endpoints
        ).endpoint;
      }
    };

    const setupInitialEndpointOption = (networkIdx: number) => {
      if (networkIdx === endpointKey.ASTAR) {
        selEndpointAstar.value = $endpoint.value;
        randomizedEndpoint(endpointKey.SHIDEN);
        randomizedEndpoint(endpointKey.SHIBUYA);
        return;
      }

      if (networkIdx === endpointKey.SHIDEN) {
        selEndpointShiden.value = $endpoint.value;
        randomizedEndpoint(endpointKey.ASTAR);
        randomizedEndpoint(endpointKey.SHIBUYA);
        return;
      }

      if (networkIdx === endpointKey.SHIBUYA) {
        selEndpointShibuya.value = $endpoint.value;
        randomizedEndpoint(endpointKey.ASTAR);
        randomizedEndpoint(endpointKey.SHIDEN);
        return;
      }
    };

    watch(
      [$endpoint, selNetwork],
      () => {
        setupInitialEndpointOption(props.networkIdx);
      },
      { immediate: true }
    );

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
      selEndpointAstar,
      selEndpointShiden,
      selEndpointShibuya,
      setSelEndpoint,
      checkIsCheckedEndpoint,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-network.scss';
</style>
