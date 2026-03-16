import { FileMetrics } from '../value-objects/FileMetrics';

export interface TechnicalDebt {
  repository: string;
  analyzedAt: Date;
  metrics: FileMetrics[];
  summary: {
    totalFiles: number;
    totalLOC: number;
    avgFunctionSize: number;
    testCoverage: number; // ratio tests/functions
  };
  aiAnalysis: {
    debtScore: number;       // 0-100
    findings: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
}