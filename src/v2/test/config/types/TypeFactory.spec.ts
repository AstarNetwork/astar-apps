import { TypeFactory } from 'src/v2/config/types';

abstract class TestBase {
  protected name: string;

  constructor() {
    this.name = '';
  }
}

class TestA extends TestBase {
  constructor() {
    super();
    super.name = 'A';
  }
}

class TestB extends TestBase {
  constructor() {
    super();
    super.name = 'B';
  }
}

describe('TypeFactory.ts', () => {
  const mapping = {
    a: TestA,
    b: TestB,
  };

  it('can create a factory instance', () => {
    var factory = new TypeFactory(mapping);

    expect(factory).toBeTruthy();
  });

  it('returns instance of a registered type', () => {
    var factory = new TypeFactory(mapping);

    const instace = factory.getInstance('a');

    expect(instace).toBeTruthy();
    expect(instace).toBeInstanceOf(TestA);
  });

  it('throws error if type is not registered', () => {
    var factory = new TypeFactory(mapping);

    expect(() => factory.getInstance('c')).toThrow(Error);
  });
});
