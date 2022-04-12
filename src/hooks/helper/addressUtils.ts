import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getSs58FromEvmPublicKey } from '../custom-signature/utils';

interface EvmMappedAddress {
  evm: string;
  ss58: string;
}

export function getShortenAddress(address: string, place = 6): string {
  return address ? `${address.slice(0, place)}${'.'.repeat(place)}${address.slice(-place)}` : '';
}

const storedEvmAddressMapping = (): EvmMappedAddress[] | [] => {
  const data = localStorage.getItem(LOCAL_STORAGE.EVM_ADDRESS_MAPPING);
  const addressMapping = data ? JSON.parse(data) : [];
  return addressMapping;
};

export const getEvmMappedSs58Address = (evmAddress: string): string => {
  const addressMap = storedEvmAddressMapping();
  const address = addressMap.find((it: EvmMappedAddress) => it.evm === evmAddress);
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
