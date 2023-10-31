export type AdditionalData = {
  [key: string]: string;
};

/**
 * Data structure to be passed to setIDentity call;
 * Currently we are supporting only display and additional fields.
 */
export class IdentityData {
  constructor(public display?: string, public additional?: AdditionalData[]) {
    this.display = display;
    this.additional = additional;
  }

  getAvatarContractAddress(): string | undefined {
    return this.additional?.find((x) => x.key === 'avatarNftAddress')?.value;
  }

  getAvatarTokenId(): string | undefined {
    return this.additional?.find((x) => x.key === 'avatarNftId')?.value;
  }
}

export interface Deposit {
  basic: bigint;
  field: bigint;
}
