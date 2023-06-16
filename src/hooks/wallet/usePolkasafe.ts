import { Polkasafe } from 'polkasafe';
import { getInjector } from 'src/hooks/helper/wallet';
import { useAccount } from 'src/hooks/useAccount';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { watchEffect, computed, watch, ref } from 'vue';

export const usePolkasafe = () => {
  const store = useStore();
  const selectedAddress = computed<string>(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  // const client = ref<Polkasafe>(new Polkasafe());
  const isClient = ref<boolean>(false);

  watch([substrateAccounts, selectedAddress], async () => {
    if (!substrateAccounts.value || !selectedAddress.value) return;
    const injector = await getInjector(substrateAccounts.value);
    // const clientData = await client.connect('astar', selectedAddress.value, injector);
    const client = new Polkasafe();
    const clientData = await client.connect(
      'astar',
      '5H6DC1YjyD531FiGxPCpWY3WNJrp5kQ35xHm6wibKuFvWzKW',
      injector
    );
    container.addConstant<Polkasafe>(Symbols.PolkasafeClient, client);
    isClient.value = true;
    const c = container.get<Polkasafe>(Symbols.PolkasafeClient);
    const multisigAddress = 'Wo1f2iyFQNYPnbFVX7Ux1B9ybNiSM24c2zrjGLtBqxAazFk';
    const { data, error } = await c.getMultisigDataByAddress(multisigAddress);
    console.log('data', data);
    console.log('error', error);
    // console.log('selectedAddress.value', selectedAddress.value);
    // console.log('clientData', clientData);
    // if (clientData) {
    //   // const multisigAddress = 'Wo1f2iyFQNYPnbFVX7Ux1B9ybNiSM24c2zrjGLtBqxAazFk';
    //   // const { data, error } = await client.getMultisigDataByAddress(multisigAddress);
    //   const { data, error } = await client.connectAddress(
    //     '5H6DC1YjyD531FiGxPCpWY3WNJrp5kQ35xHm6wibKuFvWzKW'
    //   );
    //   console.log('data', data);
    //   console.log('error', error);
    // }
  });

  watch([isClient], async () => {
    console.log(1);
    if (!isClient.value) return;
    console.log(2);
    // const c = container.get<Polkasafe>(Symbols.PolkasafeClient);
    // const multisigAddress = 'Wo1f2iyFQNYPnbFVX7Ux1B9ybNiSM24c2zrjGLtBqxAazFk';
    // const { data, error } = await c.getMultisigDataByAddress(multisigAddress);
    // console.log('data', data);
    // console.log('error', error);
    // const { data, error } = await c.connectAddress(
    //   '5H6DC1YjyD531FiGxPCpWY3WNJrp5kQ35xHm6wibKuFvWzKW'
    // );
  });

  return {};
};
