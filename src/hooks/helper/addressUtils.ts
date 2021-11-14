export function getShortenAddress(address: string): string {
  return address ? `${address.slice(0, 6)}${'.'.repeat(6)}${address.slice(-6)}` : '';
}
