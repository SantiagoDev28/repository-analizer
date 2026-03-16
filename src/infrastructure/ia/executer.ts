import { FileMetrics } from '../../domain/value-objects';

// Ejecutor — recibe el nombre del skill + args del modelo y devuelve el resultado
export function executeSkill(
  skillName: string,
  args: Record<string, unknown>,
  metrics: FileMetrics[],
): unknown {
  switch (skillName) {
    case 'get_files_above_threshold': {
      const threshold = args.threshold as number;
      return metrics
        .filter((f) => f.linesOfCode > threshold)
        .map((f) => ({ path: f.path, linesOfCode: f.linesOfCode }));
    }

    case 'get_files_without_tests': {
      return metrics
        .filter((f) => f.numberOfTests === 0 && f.numberOfFunctions > 0)
        .map((f) => ({ path: f.path, functions: f.numberOfFunctions }));
    }

    case 'get_complexity_hotspots': {
      const fnThreshold = args.functionLineThreshold as number;
      return metrics
        .filter((f) => f.largestFunctionLines > fnThreshold)
        .map((f) => ({
          path: f.path,
          largestFunctionLines: f.largestFunctionLines,
        }));
    }

    default:
      return { error: `Unknown skill: ${skillName}` };
  }
}
