<template>
  <div>
    <q-tabs v-model="tab" dense narrow-indicator>
      <q-tab name="markdown" label="Markdown"></q-tab>
      <q-tab name="preview" label="Preview"></q-tab>
    </q-tabs>

    <q-tab-panels v-model="tab">
      <q-tab-panel name="markdown">
        <q-input v-model="description" filled autogrow class="tw-h-56 tw-min-w-full" />
      </q-tab-panel>
      <q-tab-panel name="preview">
        <q-markdown :src="description" class="tw-h-56 tw-fit"></q-markdown>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const description = ref<string>('');
    const tab = ref<string>('markdown');

    return {
      description,
      tab,
    };
  },
});
</script>
