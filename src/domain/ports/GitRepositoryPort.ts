import { RepositoryFile } from '../value-objects/RepositoryFile';

export interface GitRepositoryPort {
  getFiles(repoUrl: string): Promise<RepositoryFile[]>;
}