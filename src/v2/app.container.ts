import 'reflect-metadata';
import { container } from 'inversify-props';
import { IApi } from './integration';
import { Api } from './integration/implementation';

export default function buildDependencyContainer(): void {
  container.addSingleton<IApi>(Api);
}
