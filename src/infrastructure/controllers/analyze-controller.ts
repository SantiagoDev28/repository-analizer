import { Controller, Post, Body, Inject } from '@nestjs/common';
import { AnalyzeRepositoryDTO } from '../dto/http/analyze-repository.dto';
import { AnalyzeRepositoryUseCase } from '../../application/use-cases/analize-repository-use-case';

@Controller('analyze')
export class AnalyzeController {
  constructor(
    private readonly analyzeUseCase: AnalyzeRepositoryUseCase,
  ) {}

  @Post()
  async analyze(@Body() dto: AnalyzeRepositoryDTO) {
    return this.analyzeUseCase.execute(dto.repoUrl);
  }
}