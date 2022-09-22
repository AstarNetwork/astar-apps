import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { TypeMapping } from './TypeMapping';

export interface ITypeFactory {
  getInstance(key: string, ...args: unknown[]): unknown;
}

/**
 * Creates an instance of a registered type from a given string, based on provided mapping between key and type.
 */
@injectable()
export class TypeFactory {
  constructor(@inject(Symbols.TypeMappings) private mapping: TypeMapping) {}

  public getInstance(key: string, ...args: unknown[]) {
    Guard.ThrowIfUndefined('key', key);

    const type = this.mapping[key];

    if (!type) {
      throw new Error(`${key} can not be found in provided typeMappings`);
    }

    return new type(args);
  }
}
