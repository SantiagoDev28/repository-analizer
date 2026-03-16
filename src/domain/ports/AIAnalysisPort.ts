import { FileMetrics, AiAnalysis} from '../value-objects';

export interface AIAnalyzerPort {
  analyze(metrics: FileMetrics[], repoContext: string): Promise<AiAnalysis>;
}