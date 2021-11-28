<template>
  <div>
    <q-tabs v-model="tab" dense narrow-indicator>
      <q-tab name="markdown" label="Markdown"></q-tab>
      <q-tab name="preview" label="Preview"></q-tab>
    </q-tabs>

    <q-tab-panels v-model="tab">
      <q-tab-panel name="markdown">
        <q-input
          v-model="data.description"
          maxlength="5000"
          outlined
          autogrow
          class="tw-h-96 tw-min-w-full"
          :rules="[(v) => v !== '' || 'Tell the world something about your dApp.']"
        />
        <!-- TODO description validation -->
      </q-tab-panel>
      <q-tab-panel name="preview">
        <q-markdown
          :src="data.description"
          no-emoji="false"
          no-html="true"
          class="tw-h-96 tw-fit"
        ></q-markdown>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
<script lang="ts">
import { NewDappItem } from 'src/store/dapps-store/state';
import { defineComponent, ref, PropType, reactive, toRefs, watch } from 'vue';

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const tab = ref<string>('markdown');
    const data = reactive<NewDappItem>(props.value);

    // const validateDescription = (): boolean => {
    //   return validate('description', 'Please tell us a few words about your dApp.');
    // };

    watch(
      () => data,
      () => {
        emit('dataChanged', data);
      },
      { deep: true }
    );

    return {
      tab,
      data,
      ...toRefs(props),
    };
  },
});
</script>
