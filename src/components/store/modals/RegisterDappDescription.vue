<template>
  <div>
    <q-tabs v-model="tab" dense narrow-indicator>
      <q-tab name="markdown" label="Markdown"></q-tab>
      <q-tab name="preview" label="Preview"></q-tab>
    </q-tabs>

    <q-tab-panels v-model="tab">
      <q-tab-panel name="markdown">
        <q-scroll-area class="tw-h-96">
          <q-input
            v-model="data.description"
            maxlength="5000"
            outlined
            autogrow
            class="tw-h-96 tw-min-w-full"
            :rules="[(v) => (v && v.length > 0) || 'Tell the world something about your dApp.']"
          />
        </q-scroll-area>
      </q-tab-panel>
      <q-tab-panel name="preview">
        <q-scroll-area class="tw-h-96">
          <q-markdown :src="data.description" :no-html="noHtml"></q-markdown>
        </q-scroll-area>
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
    const noEmoji = ref<boolean>(false);
    const noHtml = ref<boolean>(true);

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
      noEmoji,
      noHtml,
      ...toRefs(props),
    };
  },
});
</script>
