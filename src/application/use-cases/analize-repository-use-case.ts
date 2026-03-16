import { Inject, Injectable } from '@nestjs/common';
import type { GitRepositoryPort } from '../../domain/ports/GitRepositoryPort';
import type { AIAnalyzerPort } from '../../domain/ports/AIAnalysisPort';
import { TechnicalDebt } from '../../domain/entities/TechnicalDebt';
import { CodeParser } from '../../infrastructure/parsers/code-parser';
import { DI_TOKENS } from '../../infrastructure/config/di.tokens';

@Injectable()
export class AnalyzeRepositoryUseCase {
  private parser = new CodeParser();

  constructor(
    @Inject(DI_TOKENS.GitRepositoryPort)
    private readonly gitPort: GitRepositoryPort,
    @Inject(DI_TOKENS.AIAnalyzerPort)
    private readonly aiPort: AIAnalyzerPort,
  ) {}

  async execute(repoUrl: string): Promise<TechnicalDebt> {
    const allFiles = await this.gitPort.getFiles(repoUrl);
    const relevantFiles = this.parser.filterRelevantFiles(allFiles);
    const metrics = relevantFiles.map((f) => this.parser.parseMetrics(f));

    const totalLOC = metrics.reduce((sum, f) => sum + f.linesOfCode, 0);
    const totalFunctions = metrics.reduce((sum, f) => sum + f.numberOfFunctions, 0);
    const totalTests = metrics.reduce((sum, f) => sum + f.numberOfTests, 0);

    const aiAnalysis = await this.aiPort.analyze(metrics, repoUrl);

    return {
      repository: repoUrl,
      analyzedAt: new Date(),
      metrics,
      summary: {
        totalFiles: metrics.length,
        totalLOC,
        avgFunctionSize: totalLOC / (totalFunctions || 1),
        testCoverage: totalTests / (totalFunctions || 1),
      },
      aiAnalysis,
    };
  }
}