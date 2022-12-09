import { XvmAsset } from 'src/modules/token';
import { XvmGetAssetsParam } from './../services/IXvmService';
export interface IXvmRepository {
  getAssets(param: XvmGetAssetsParam): Promise<XvmAsset[]>;
}
