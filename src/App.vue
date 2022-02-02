<template>
  <div>
    <dashboard-layout>
      <router-view v-slot="{ Component }">
        <template v-if="Component">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <Suspense>
                <template #default>
                  <component :is="Component"></component>
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
import Spinner from 'components/common/Spinner.vue';
import ModalLoading from 'components/common/ModalLoading.vue';
import AlertBox from 'components/common/AlertBox.vue';
import 'animate.css';

export default defineComponent({
  name: 'App',
  components: {
    DashboardLayout,
    Spinner,
    ModalLoading,
    AlertBox,
  },
  setup() {
    const store = useStore();
    const isLoading = computed(() => store.getters['general/isLoading']);
    const showAlert = computed(() => store.getters['general/showAlert']);

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
