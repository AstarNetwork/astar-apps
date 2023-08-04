<template>
  <div v-if="isLoadingCollators">
    <q-skeleton class="skeleton--value-panel" />
  </div>
  <div v-else class="wrapper--value">
    <collator-value-half :accounts="collators" title="Collators" />
    <collator-value-half :accounts="validators" title="Validators" />
  </div>
</template>

<script lang="ts">
import { $api } from 'src/boot/api';
import { defineComponent, ref, watchEffect } from 'vue';
import CollatorValueHalf from 'src/components/dashboard/CollatorsValueHalf.vue';
export default defineComponent({
  components: { CollatorValueHalf },
  setup() {
    const collators = ref<string[]>();
    const validators = ref<string[]>();
    const isLoadingCollators = ref<boolean>(false);

    const handleFetchCollators = async (): Promise<void> => {
      try {
        isLoadingCollators.value = true;
        const [collatorsRaw, validatorsRaw] = await Promise.all([
          $api!.query.collatorSelection.candidates(),
          $api!.query.session.validators(),
        ]);

        const formatCollatorsNames = async () => {
          return await await Promise.all(
            // @ts-ignore
            collatorsRaw.map(async (it: any) => {
              const item = it.toJSON();
              const account = await $api!.derive.accounts.info(item.who);
              return account !== undefined && account.identity.display
                ? account.identity.display
                : item.who.toString();
            })
          );
        };

        const formatValidatorsNames = async () => {
          return await Promise.all(
            validatorsRaw.map(async (it) => {
              const account = await $api!.derive.accounts.info(it);
              return account !== undefined && account.identity.display
                ? account.identity.display
                : it.toString();
            })
          );
        };

        const [c, v] = await Promise.all([formatCollatorsNames(), formatValidatorsNames()]);
        collators.value = c;
        validators.value = v;
      } catch (error) {
        collators.value = [];
        validators.value = [];
      } finally {
        isLoadingCollators.value = false;
      }
    };

    watchEffect(handleFetchCollators);

    return { collators, validators, isLoadingCollators };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/collators.scss';
</style>
