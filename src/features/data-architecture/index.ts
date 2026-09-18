export * from './domain/index.ts';
export * from './repositories/index.ts';

import { SyntheticRepository } from './repositories/synthetic-repository.ts';

let defaultRepoInstance: SyntheticRepository | null = null;

export function getDefaultRepository(): SyntheticRepository {
  if (!defaultRepoInstance) {
    defaultRepoInstance = new SyntheticRepository();
  }
  return defaultRepoInstance;
}
