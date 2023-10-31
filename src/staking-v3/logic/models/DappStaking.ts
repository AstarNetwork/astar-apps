import { ProtocolState } from './Node';

/**
 * Dapp model containing the basic information so dApps can be displayed on the homepage.
 */
export interface DappBase {
  address: string;
  name: string;
  iconUrl: string;
  mainCategory?: string;
}

/**
 * Full dApp model used to display a dApp details.
 */
export interface Dapp extends DappBase {}

/**
 * Used to notify subscribers about protocol state changes.
 */
export class ProtocolStateChangedMessage {
  constructor(public state: ProtocolState) {}
}
