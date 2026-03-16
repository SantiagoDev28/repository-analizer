import { Module } from '@nestjs/common';
import { GithubRepositoryAdapter } from '../github/github-repository-adapter';
import { DI_TOKENS } from '../config/di.tokens';

@Module({
  providers: [
    {
      provide: DI_TOKENS.GitRepositoryPort,
      useFactory: () => new GithubRepositoryAdapter(),
    },
  ],
  exports: [DI_TOKENS.GitRepositoryPort],
})
export class GithubModule {}