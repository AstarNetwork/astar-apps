import { ref, watch } from 'vue';
import { compactAddLength, isWasm } from '@polkadot/util';
import { FileState } from './useFile';

export function useWasm(
  abi: any,
  wasmFromFile: FileState | null,
  isWasmFromFileValid: (_: FileState) => boolean
) {
  const wasm = ref();
  const isWasmValid = ref(false);

  watch(abi, () => {
    // console.log('constructor', abi.value?.constructors);
    if (abi.value && isWasm(abi.value.project.source.wasm)) {
      wasm.value = abi.value.project.source.wasm;
      isWasmValid.value = true;

      return;
    }

    if (wasmFromFile && isWasmFromFileValid(wasmFromFile)) {
      wasm.value = compactAddLength(wasmFromFile.data);
      isWasmValid.value = true;

      return;
    }

    wasm.value = null;
    isWasmValid.value = false;
  });

  return { wasm, isWasmValid };
}
