import { Container as InversifyContainer, interfaces } from 'inversify';

export type Constructor<T = any> =
  | {
      new (...args: any[]): T;
    }
  | any;

export type Id = string | symbol;

export class Container extends InversifyContainer {
  public addTransient<T>(
    constructor: Constructor<T>,
    customId?: Id
  ): interfaces.BindingWhenOnSyntax<T> {
    const id = this.getId(constructor, customId);

    return super.bind<T>(id).to(constructor).inTransientScope();
  }

  public addSingleton<T>(
    constructor: Constructor<T>,
    customId?: Id
  ): interfaces.BindingWhenOnSyntax<T> {
    const id = this.getId(constructor, customId);

    return super.bind<T>(id).to(constructor).inSingletonScope();
  }

  public addConstant<T>(customId: Id, constant: T): interfaces.BindingWhenOnSyntax<T> {
    return super.bind<T>(customId).toConstantValue(constant);
  }

  public removeConstant(customId: Id): void {
    super.unbind(customId);
  }

  public addRequest<T>(
    constructor: Constructor<T>,
    customId?: Id
  ): interfaces.BindingWhenOnSyntax<T> {
    const id = this.getId(constructor, customId);

    return super.bind<T>(id).to(constructor).inRequestScope();
  }

  public get<T>(serviceIdentifier: Id): T {
    return super.get<T>(serviceIdentifier);
  }

  private getId<T>(constructor: Constructor<T>, id?: Id) {
    return id ? id : Symbol.for(constructor.name);
  }
}

let container: Container;

export function getContainer(): Container {
  return container;
}

export function setContainer(options?: interfaces.ContainerOptions): Container {
  return (container = new Container(options));
}

export function resetContainer() {
  getContainer().unbindAll();
}
