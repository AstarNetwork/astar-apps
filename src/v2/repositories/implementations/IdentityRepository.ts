import { Data, Option, Vec } from '@polkadot/types';
import { PalletIdentityIdentityInfo, PalletIdentityRegistration } from '@polkadot/types/lookup';
import { Tuple } from '@polkadot/types';
import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { ExtrinsicPayload, IApi } from 'src/v2/integration';
import { IdentityData } from 'src/v2/models';
import { IIdentityRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { ITuple } from '@polkadot/types/types';

@injectable()
export class IdentityRepository implements IIdentityRepository {
  constructor(@inject(Symbols.DefaultApi) private readonly api: IApi) {}

  public async getIdentity(address: string): Promise<IdentityData> {
    Guard.ThrowIfUndefined('address', address);
    const api = await this.api.getApi();
    const identity = await api.query.identity.identityOf<PalletIdentityRegistration>(address);
    const data = new IdentityData(identity.info.toString());

    return data;
  }

  public async getSetIdentityCall(address: string, data: IdentityData): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined('data', data);

    const api = await this.api.getApi();
    const registrationOption = await api.query.identity.identityOf<
      Option<PalletIdentityRegistration>
    >(address);
    let registration = registrationOption.isSome ? registrationOption.unwrap() : undefined;
    let payload = {} as PalletIdentityIdentityInfo;

    if (registration !== undefined) {
      // Update identity.
      switch (true) {
        case !!data.display:
          registration.info.set('display', new Data(api.registry, { raw: data.display }));
        case !!data.additional:
          data.additional?.forEach((x) => {
            // Check if additional field already exists in identity.
            const additional = registration?.info.additional.find(
              (y) => y[0].value.toHuman() === x.key
            );
            if (additional) {
              // Update existing additional field value.
              additional[1] = new Data(api.registry, { raw: x.value });
            } else {
              // Add new additional field.
              registration?.info.additional.push(<ITuple<[Data, Data]>>[
                new Data(api.registry, { raw: x.key }),
                new Data(api.registry, { raw: x.value }),
              ]);
            }
          });
      }

      payload = registration.info;
    } else {
      // Create a new identity.
      const additional =
        data.additional?.map((x) => [
          new Data(api.registry, { raw: x.key }),
          new Data(api.registry, { raw: x.value }),
        ]) ?? [];

      payload = {
        display: new Data(api.registry, { raw: data.display }),
        additional,
      } as PalletIdentityIdentityInfo;
    }
    const call = api.tx.identity.setIdentity(payload);

    return call;
  }
}
