export interface AiAnalysis {
  debtScore: number;
  findings: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}