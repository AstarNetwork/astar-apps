import { Polkasafe } from 'polkasafe';
import { getInjector } from 'src/hooks/helper/wallet';
import { useAccount } from 'src/hooks/useAccount';
import { useStore } from 'src/store';
import { watchEffect, computed, watch, ref } from 'vue';

export const usePolkasafe = () => {
  const store = useStore();
  const selectedAddress = computed<string>(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  // const client = ref<Polkasafe>(new Polkasafe());

  watch([substrateAccounts, selectedAddress], async () => {
    if (!substrateAccounts.value || !selectedAddress.value) return;
    const injector = await getInjector(substrateAccounts.value);
    // const clientData = await client.connect('astar', selectedAddress.value, injector);
    const client = new Polkasafe();
    // const clientData = await client.connect(
    //   'astar',
    //   '5H6DC1YjyD531FiGxPCpWY3WNJrp5kQ35xHm6wibKuFvWzKW',
    //   injector
    // );
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

  // watch([client], async () => {
  //   if (!client.value || client.value !== undefined) return;
  //   const { data, error } = await client.connectAddress(
  //     '5H6DC1YjyD531FiGxPCpWY3WNJrp5kQ35xHm6wibKuFvWzKW'
  //   );
  // });

  return {};
};
