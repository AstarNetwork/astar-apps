<template>
  <div>
    <dashboard-layout>
      <router-view v-slot="{ Component }">
        <template v-if="Component">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <Suspense>
                <template #default>
                  <api-loader>
                    <component :is="Component"></component>
                  </api-loader>
                </template>
                <template #fallback>
                  <modal-loading />
                </template>
              </Suspense>
            </keep-alive>
          </transition>
        </template>
      </router-view>
    </dashboard-layout>

    <modal-loading v-if="isLoading" />

    <transition name="fade">
      <alert-box
        v-show="showAlert.showAlertMsg"
        :msg="showAlert.alertMsg"
        :alert-type="showAlert.alertType"
      />
    </transition>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import DashboardLayout from 'layouts/DashboardLayout.vue';
import { useStore } from 'src/store';
import { useMeta } from 'quasar';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { opengraphMeta } from 'src/config/opengraph';
import ApiLoader from 'src/hooks/providers/ApiLoader.vue';
import Spinner from 'components/common/Spinner.vue';
import ModalLoading from 'components/common/ModalLoading.vue';
import AlertBox from 'components/common/AlertBox.vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
export default defineComponent({
  name: 'App',
  components: {
    DashboardLayout,
    ApiLoader,
    Spinner,
    ModalLoading,
    AlertBox,
  },
  setup() {
    const store = useStore();
    const isLoading = computed(() => store.getters['general/isLoading']);
    const showAlert = computed(() => store.getters['general/showAlert']);

    const { NETWORK_IDX, CUSTOM_ENDPOINT } = LOCAL_STORAGE;

    const networkIdx = localStorage.getItem(NETWORK_IDX);
    const customEndpoint = localStorage.getItem(CUSTOM_ENDPOINT);
    if (networkIdx) {
      store.commit('general/setCurrentNetworkIdx', parseInt(networkIdx));
    }
    if (customEndpoint) {
      store.commit('general/setCurrentCustomEndpoint', customEndpoint);
    }

    if (networkIdx) {
      const favicon = providerEndpoints[parseInt(networkIdx)].favicon;

      useMeta({
        title: '',
        titleTemplate: (title) => `${title} | Astar Apps Portal`,
        htmlAttr: { lang: 'en' },
        link: {
          material: {
            rel: 'icon',
            href: favicon,
          },
        },
        meta: opengraphMeta,
      });
    }

    return {
      isLoading,
      showAlert,
    };
  },
});
</script>
<style>
::-webkit-scrollbar {
  width: 7px;
}

::-webkit-scrollbar-track {
  background: #cbd5e0;
}

::-webkit-scrollbar-thumb {
  background: #718096;
}

::-webkit-scrollbar-thumb:hover {
  background: #2d3748;
}

.bg-black-alt {
  background: #191919;
}
.text-black-alt {
  color: #191919;
}
.border-black-alt {
  border-color: #191919;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
