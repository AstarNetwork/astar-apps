import 'reflect-metadata';
import { TypeFactory } from 'src/v2/config/types';

abstract class TestBase {
  protected name: string;

  constructor() {
    this.name = '';
  }
}

class AcalaXCM extends TestBase {
  constructor() {
    super();
    super.name = 'Acala';
  }
}

class MoonbeamXCM extends TestBase {
  constructor() {
    super();
    super.name = 'Moonebam';
  }
}

describe('TypeFactory.ts', () => {
  const mapping = {
    acala: AcalaXCM,
    moonbeam: MoonbeamXCM,
  };

  it('can create a factory instance', () => {
    var factory = new TypeFactory(mapping);

    expect(factory).toBeTruthy();
  });

  it('returns instance of a registered type', () => {
    var factory = new TypeFactory(mapping);

    const instace = factory.getInstance('acala');

    expect(instace).toBeTruthy();
    expect(instace).toBeInstanceOf(AcalaXCM);
  });

  it('throws error if type is not registered', () => {
    var factory = new TypeFactory(mapping);

    expect(() => factory.getInstance('statemint')).toThrow(
      'statemint can not be found in provided typeMappings'
    );
  });
});
