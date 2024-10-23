
import { BN } from "@polkadot/util";
import { formatEther } from "viem";

export function formatEtherAsString(wei: bigint | string | BN): string {
  let weiBigInt: bigint;

  if (typeof wei === "bigint") {
    weiBigInt = wei;
  } else if (typeof wei === "string") {
    weiBigInt = BigInt(wei);
  } else if (wei instanceof BN) {
    weiBigInt = BigInt(wei.toString());
  } else {
    throw new Error("Invalid input type");
  }

  return formatEther(weiBigInt);
}

export function formatEtherAsNumber(wei: bigint | string | BN): number {
  const etherBigInt = BigInt(formatEtherAsString(wei));
  const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

  if (etherBigInt > MAX_SAFE_INTEGER_BIGINT || etherBigInt < -MAX_SAFE_INTEGER_BIGINT) {
    throw new Error("Value is outside of safe integer bounds for JavaScript numbers");
  }

  return Number(etherBigInt);
}
