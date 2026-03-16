import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GithubModule } from './infrastructure/modules/github.module';
import { IAModule } from './infrastructure/modules/ai.module';
import { AnalyzeController } from './infrastructure/controllers/analyze-controller';
import { AnalyzeRepositoryUseCase } from './application/use-cases/analize-repository-use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GithubModule,
    IAModule,
  ],
  controllers: [AnalyzeController],
  providers: [AnalyzeRepositoryUseCase],
})
export class AppModule {}
