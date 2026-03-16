export interface FileMetrics {
  path: string;
  linesOfCode: number;
  numberOfFunctions: number;
  numberOfClasses: number;
  numberOfTests: number;
  largestFunctionLines: number;
}