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
}
