import { Guard } from 'src/v2/common';
import { TypeMapping } from './TypeMapping';

/**
 * Creates an instance of a registered type from given string based on provided mapping between key and type.
 */
export class TypeFactory {
  private mapping: TypeMapping;

  constructor(typeMapping: TypeMapping) {
    this.mapping = typeMapping;
  }

  public getInstance(key: string) {
    Guard.ThrowIfUndefined('key', key);

    const type = this.mapping[key];

    if (!type) {
      throw new Error(`${key} can not be found in provided typeMappings`);
    }

    return new type();
  }
}
