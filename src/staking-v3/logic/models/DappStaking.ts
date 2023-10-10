/**
 * Dapp model containing the basic information so dApps can be displayed on the homepage.
 */
export class DappBase {
  constructor(public address: string, public name: string, public iconUrl: string) {}
}

/**
 * Full dApp model used to display a dApp details.
 */
export class Dapp extends DappBase {}
