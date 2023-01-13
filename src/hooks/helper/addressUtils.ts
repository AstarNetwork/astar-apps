import { checkSumEvmAddress } from '@astar-network/astar-sdk-core';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getSs58FromEvmPublicKey } from '../custom-signature/utils';

interface EvmMappedAddress {
  evm: string;
  ss58: string;
}

const storedEvmAddressMapping = (): EvmMappedAddress[] | [] => {
  const data = localStorage.getItem(LOCAL_STORAGE.EVM_ADDRESS_MAPPING);
  const addressMapping = data ? JSON.parse(data) : [];
  return addressMapping;
};

export const getEvmMappedSs58Address = (evmAddress: string): string => {
  const addressMap = storedEvmAddressMapping();
  const address = addressMap.find((it: EvmMappedAddress) => {
    return checkSumEvmAddress(it.evm) === checkSumEvmAddress(evmAddress);
  });
  return address ? address.ss58 : '';
};

export const setAddressMapping = async ({
  evmAddress,
  requestSignature,
}: {
  evmAddress: string;
  requestSignature: (loginMsg: string, evmAddress: string) => Promise<string>;
}): Promise<void> => {
  const isSigned = getEvmMappedSs58Address(evmAddress);
  if (isSigned) return;

  const addressMap = storedEvmAddressMapping();
  const ss58 = await getSs58FromEvmPublicKey({ evmAddress, requestSignature });
  const updatedAddressMap = [{ evm: evmAddress, ss58 }, ...addressMap];
  localStorage.setItem(
    LOCAL_STORAGE.EVM_ADDRESS_MAPPING,
    JSON.stringify(updatedAddressMap.slice(0, 25))
  );
};
