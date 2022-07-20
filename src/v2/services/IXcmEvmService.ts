import { Network } from '../config/types';
import { Asset } from '../models';
import { IXcmTransfer } from './IXcmService';

/**
 * Definition of service used to withdraw assets from EVM account to parachain.
 */
export interface IXcmEvmService extends IXcmTransfer {}
