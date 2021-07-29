import { ref, watch } from 'vue';
import type { AbiMessage } from '@polkadot/api-contract/types';
import { MessageType } from './types/Message';

export function useMessages(abi: any) {
  const messages = ref<MessageType[] | null>(null);

  watch(
    abi,
    () => {
      if (abi?.value?.constructors && abi?.value?.messages) {
        const constructors = abi?.value?.constructors.map((e: AbiMessage) => {
          return {
            index: e.index,
            identifier: e.identifier,
            docs: e.docs,
            args: e.args,
            returnType: e.returnType,
            isConstructor: e.isConstructor,
          };
        });
        const msgs = abi?.value?.messages.map((e: AbiMessage) => {
          return {
            index: e.index,
            identifier: e.identifier,
            docs: e.docs,
            args: e.args,
            returnType: e.returnType,
            isConstructor: e.isConstructor,
          };
        });
        messages.value = [...constructors, ...msgs];
      }
    },
    { immediate: true }
  );

  return { messages };
}
