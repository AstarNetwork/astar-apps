<template>
  <astar-modal-drawer :show="isOpen" title="Network" :is-closing="isClosing" @close="closeModal">
    <div class="wrapper--modal-network">
      <div class="wrapper--select-network">
        <fieldset>
          <ul role="radiogroup" class="list--network" :style="`max-height: ${windowHeight}px`">
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
                <astar-radio-btn
                  class="ip--network"
                  :checked="selNetwork === index"
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
        <astar-button
          class="btn--connect"
          :disabled="isDisabled"
          @click="selectNetwork(selNetwork, newEndpoint)"
        >
          {{ $t('connect') }}
        </astar-button>
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import { $endpoint } from 'src/boot/api';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getRandomFromArray, wait } from 'src/hooks/helper/common';
import { buildNetworkUrl } from 'src/router/utils';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, onUnmounted } from 'vue';

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

    const store = useStore();
    const newEndpoint = ref('');
    const customEndpoint = computed(() => store.getters['general/customEndpoint']);
    newEndpoint.value = customEndpoint.value;

    const isClosing = ref<boolean>(false);

    const closeModal = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
      emit('update:is-open', false);
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
        case endpointKey.ROCSTAR:
          return selEndpointRocstar.value;
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

      const network = providerEndpoints[networkIdx].networkAlias;
      const url = buildNetworkUrl(network);

      // Note: Users have to refresh the page manually for MathWallet(Android)
      window.open(url, '_self');
      location.reload();

      emit('update:is-open', false);
      emit('update:select-network', networkIdx);
    };

    const selNetwork = ref<number>(props.networkIdx);
    const selEndpointAstar = ref<string>('');
    const selEndpointShiden = ref<string>('');
    const selEndpointShibuya = ref<string>('');
    const selEndpointRocstar = ref<string>('');

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
      if (index === endpointKey.ASTAR) {
        return selEndpointAstar.value === endpoint;
      } else if (index === endpointKey.SHIDEN) {
        return selEndpointShiden.value === endpoint;
      } else if (index === endpointKey.SHIBUYA) {
        return selEndpointShibuya.value === endpoint;
      } else if (index === endpointKey.ROCSTAR) {
        return selEndpointRocstar.value === endpoint;
      } else {
        return false;
      }
    };

    const setSelEndpoint = ({
      endpointObj,
      networkIdx,
    }: {
      endpointObj: { name: string; endpoint: string };
      networkIdx: number;
      selEndpointRef: string;
    }): void => {
      if (networkIdx === endpointKey.ASTAR) {
        selEndpointAstar.value = endpointObj.endpoint;
      } else if (networkIdx === endpointKey.SHIDEN) {
        selEndpointShiden.value = endpointObj.endpoint;
      } else if (networkIdx === endpointKey.SHIBUYA) {
        selEndpointShibuya.value = endpointObj.endpoint;
      } else if (networkIdx === endpointKey.ROCSTAR) {
        selEndpointRocstar.value = endpointObj.endpoint;
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
      if (networkIdx === endpointKey.ROCSTAR) {
        selEndpointRocstar.value = getRandomFromArray(
          providerEndpoints[endpointKey.ROCSTAR].endpoints
        ).endpoint;
      }
    };

    const setupInitialEndpointOption = (networkIdx: number) => {
      if (networkIdx === endpointKey.ASTAR) {
        selEndpointAstar.value = $endpoint.value;
        randomizedEndpoint(endpointKey.SHIDEN);
        randomizedEndpoint(endpointKey.SHIBUYA);
        randomizedEndpoint(endpointKey.ROCSTAR);
        return;
      }

      if (networkIdx === endpointKey.SHIDEN) {
        selEndpointShiden.value = $endpoint.value;
        randomizedEndpoint(endpointKey.ASTAR);
        randomizedEndpoint(endpointKey.SHIBUYA);
        randomizedEndpoint(endpointKey.ROCSTAR);
        return;
      }

      if (networkIdx === endpointKey.SHIBUYA) {
        selEndpointShibuya.value = $endpoint.value;
        randomizedEndpoint(endpointKey.ASTAR);
        randomizedEndpoint(endpointKey.SHIDEN);
        randomizedEndpoint(endpointKey.ROCSTAR);
        return;
      }

      if (networkIdx === endpointKey.ROCSTAR) {
        selEndpointRocstar.value = $endpoint.value;
        randomizedEndpoint(endpointKey.ASTAR);
        randomizedEndpoint(endpointKey.SHIDEN);
        randomizedEndpoint(endpointKey.SHIBUYA);
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

    const windowHeight = ref<number>(window.innerHeight);
    const onHeightChange = () => {
      windowHeight.value = window.innerHeight - 300;
    };

    window.addEventListener('resize', onHeightChange);
    onHeightChange();

    onUnmounted(() => {
      window.removeEventListener('resize', onHeightChange);
    });

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
      windowHeight,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-network.scss';
</style>
