<template>
  <div class="wrapper--assets">
    <div class="container--assets">
      <div style="display: flex; flex-direction: column">
        <!-- <q-input
          v-model="data.name"
          standout="bg-blue-grey-10 text-white"
          stack-label
          label="Name"
          label-color="input-label"
          :input-style="{ fontWeight: 'bold', color: isDark ? '#fff' : '#000' }"
          :rules="[(v) => (v && v.length > 0) || 'dApp name is required.']"
          class="component"
          dark
        /> -->

        <q-input
          v-model="data.name"
          label="Name"
          standout
          label-color="input-label"
          input-class="input"
          :input-style="{ fontWeight: 'bold' }"
          :rules="[(v) => (v && v.length > 0) || 'dApp name is required.']"
          class="component"
        />
        <q-file
          v-model="data.icon"
          standout
          counter
          label="Project logo"
          accept=".jpg .png, image/*"
          class="component"
          input-style="{ height: '120px'}"
        >
          <template v-slot:prepend>
            <div style="width: 100px; height: 100px">+</div>
          </template>
        </q-file>
        <q-input
          v-model="data.address"
          label="Contract address"
          standout="bg-blue-grey-10 text-white"
          input-class="input"
          :rules="[(v) => isValidAddress(v) || 'Enter a valid EVM or SS58 contract address.']"
          class="component"
        />
        <q-file
          v-model="data.images"
          standout
          multiple
          append
          counter
          max-file-size="1000000"
          accept=".jpg .png, image/*"
          label="Screenshots (Max. file size 1MB)"
          class="component"
          :rules="[(v) => (v && v.length >= 4) || 'At least 4 dApp images are required.']"
          @update:model-value="updateFile()"
        >
          <!-- <template v-slot:prepend>
            <div class="tw-p-2 tw-my-4">aaa</div>
          </template> -->
          <template #file="{ file, index }">
            <q-card class="tw-p-2 tw-m-1">
              <q-img
                :src="data.imagesContent[index]"
                :title="file.name"
                fit="contain"
                width="120px"
                height="120px"
              >
                <div class="text-subtitle2 absolute-bottom tw-text-right">
                  <q-icon name="close" @click.prevent="removeFile(index)" />
                </div>
              </q-img>
              <!-- <div>{{ file.name }}</div> -->
            </q-card>
          </template>
        </q-file>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useStore } from 'src/store';
import { NewDappItem } from 'src/store/dapp-staking/state';

export default defineComponent({
  setup() {
    const store = useStore();
    const theme = computed<string>(() => store.getters['general/theme']);
    const isDark = ref<boolean>(theme.value.toLowerCase() === 'dark');
    const data = reactive<NewDappItem>({ tags: [] } as unknown as NewDappItem);

    const isValidAddress = (address: string): boolean => isEthereumAddress(address); // || isValidAddressPolkadotAddress(address);
    // TODO uncoment the code above when we will support ink contract.

    const updateFile = (): void => {
      data.imagesContent = [];
      const index = 0;
      data.images.forEach((image) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
          data.imagesContent.push(reader.result?.toString() || '');
        };
        reader.onerror = (error) => console.error(error);
      });
    };

    const removeFile = (index: number): void => {
      data.images.splice(index, 1);
      data.imagesContent.splice(index, 1);
    };

    watch([theme], (val) => {
      isDark.value = val[0].toLowerCase() === 'dark';
    });

    return {
      data,
      isDark,
      isValidAddress,
      updateFile,
      removeFile,
    };
  },
});
</script>

<style scoped lang="scss">
@use 'src/components/assets/styles/assets.scss';
.input {
  font-weight: 'bold';
  color: '#fff';
}

.component {
  margin-bottom: 20px;
}

.q-field__messages {
  font-size: 20px !important;
}
</style>
