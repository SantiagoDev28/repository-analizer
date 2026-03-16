import { IsString, IsUrl } from 'class-validator';

export class AnalyzeRepositoryDTO {
  @IsString()
  @IsUrl()
  repoUrl: string;
}