import { Module } from '@nestjs/common';
import { GroqLLMProvider } from '../ia/services/groq-llm.provider';
import { GroqAIAnalyzerAdapter } from '../ia/services/groq-aI-analyzer-adapter';
import { DI_TOKENS } from '../config/di.tokens';

@Module({
  providers: [
    {
      provide: DI_TOKENS.LLMProvider,
      useFactory: () => new GroqLLMProvider(),
    },
    {
      provide: DI_TOKENS.AIAnalyzerPort,
      useFactory: (llmProvider: GroqLLMProvider) =>
        new GroqAIAnalyzerAdapter(llmProvider),
      inject: [DI_TOKENS.LLMProvider],
    },
  ],
  exports: [DI_TOKENS.LLMProvider, DI_TOKENS.AIAnalyzerPort],
})
export class IAModule {}