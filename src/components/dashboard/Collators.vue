<template>
  <div v-if="!collators">
    <q-skeleton class="skeleton--value-panel" />
  </div>
  <div v-else class="wrapper--value" data-testid="collators-panel">
    <div class="container container--value">
      <div class="row">
        <span class="text--accent container--title--color">{{ $t('dashboard.collators') }}</span>
      </div>
      <div class="row--value-icon">
        <div class="text--xlg">
          <span class="text--value text-color--neon">
            {{ collators.length }}
          </span>
        </div>
        <div class="link--icon">
          <a :href="`${polkadotJsLink}/collators`" target="_blank" rel="noopener noreferrer">
            <button class="icon--primary">
              <astar-icon-external-link />
            </button>

            <q-tooltip>
              <span class="text--tooltip">{{ $t('polkadot.js') }}</span>
            </q-tooltip>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { $api } from 'src/boot/api';
import { defineComponent, ref, watchEffect } from 'vue';
import { useNetworkInfo } from 'src/hooks';
export default defineComponent({
  setup() {
    const { polkadotJsLink } = useNetworkInfo();
    const collators = ref<string[]>();
    const isLoadingCollators = ref<boolean>(false);

    const handleFetchCollators = async (): Promise<void> => {
      try {
        isLoadingCollators.value = true;
        const collatorsRaw = (await $api!.query.collatorSelection.candidates()) as any;
        collators.value = collatorsRaw.map(async (it: any) => {
          const item = it.toJSON();
          return item.who.toString();
        });
      } catch (error) {
        collators.value = [];
      } finally {
        isLoadingCollators.value = false;
      }
    };

    watchEffect(handleFetchCollators);

    return { collators, isLoadingCollators, polkadotJsLink };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/dashboard.scss';
</style>
