import { Chain } from 'src/v2/config/types';
import { XcmRepositoryBase } from './XcmRepositoryBase';

export class AcalaXcmRepository extends XcmRepositoryBase {
  constructor() {
    super(Chain.Acala);

    console.log('AcalaXcmRepository has been created');
  }
}
