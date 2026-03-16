import {AIAnalyzerPort } from '../../../domain/ports/AIAnalysisPort';
import { FileMetrics, AiAnalysis } from '../../../domain/value-objects';
import { GroqLLMProvider } from './groq-llm.provider';

export class GroqAIAnalyzerAdapter implements AIAnalyzerPort {
  constructor(private readonly llmProvider: GroqLLMProvider) {}

  async analyze(metrics: FileMetrics[], repoContext: string): Promise<AiAnalysis> {
    return this.llmProvider.analyzeWithSkills(metrics, repoContext);
  }
}