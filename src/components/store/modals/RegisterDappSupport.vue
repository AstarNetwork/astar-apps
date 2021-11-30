<template>
  <div>
    <q-input
      v-model="data.forumUrl"
      outlined
      label="Astar forum post link"
      maxlength="500"
      :rules="[(v) => v !== '' || 'Astar forum post link is required.']"
      class="tw-my-2"
    />
    <q-input
      v-model="data.authorContact"
      outlined
      label="Author contact email"
      maxlength="500"
      :rules="[(v) => v !== '' || 'Author contact email is required.']"
      class="tw-my-2"
    />
    <q-select
      v-model="data.license"
      outlined
      :options="licenseTypes"
      label="License type"
      class="tw-my-2"
    />
  </div>
</template>
<script lang="ts">
import { NewDappItem } from 'src/store/dapps-store/state';
import { defineComponent, PropType, reactive } from 'vue';

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  setup(props) {
    const data = reactive<NewDappItem>(props.value);
    const licenseTypes = ['GPL-3.0 License', 'MIT'];

    return {
      data,
      licenseTypes,
    };
  },
});
</script>
