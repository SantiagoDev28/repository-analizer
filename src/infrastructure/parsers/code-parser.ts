import { FileMetrics } from '../../domain/value-objects';
import { RepositoryFile } from '../../domain/value-objects/RepositoryFile';

const ALLOWED_EXTENSIONS = ['.ts', '.js', '.java', '.yml', '.json'];
const IGNORED_DIRS = ['node_modules', 'dist', 'build'];

export class CodeParser {
  
  filterRelevantFiles(files: RepositoryFile[]): RepositoryFile[] {
    return files.filter((file) => {
      const isIgnored = IGNORED_DIRS.some((dir) => file.path.includes(`/${dir}/`));
      const isAllowed = ALLOWED_EXTENSIONS.some((ext) => file.path.endsWith(ext));
      return !isIgnored && isAllowed;
    });
  }

  parseMetrics(file: RepositoryFile): FileMetrics {
    const lines = file.content.split('\n');
    const nonEmptyLines = lines.filter((l) => l.trim().length > 0);

    return {
      path: file.path,
      linesOfCode: nonEmptyLines.length,
      numberOfFunctions: this.countFunctions(file.content, file.extension),
      numberOfClasses: this.countClasses(file.content, file.extension),
      numberOfTests: this.countTests(file.content),
      largestFunctionLines: this.getLargestFunctionSize(file.content),
    };
  }

  private countFunctions(content: string, ext: string): number {
    if (ext === '.java') {
      // Detecta métodos Java: public/private/protected ... nombre(
      return (content.match(/(?:public|private|protected|static)\s+\w+\s+\w+\s*\(/g) ?? []).length;
    }
    // TS/JS: function declarations + arrow functions asignadas
    const fnDecl = (content.match(/function\s+\w+\s*\(/g) ?? []).length;
    const arrows = (content.match(/(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(/g) ?? []).length;
    const methods = (content.match(/^\s{2,}\w+\s*(?:async\s*)?\(/gm) ?? []).length;
    return fnDecl + arrows + methods;
  }

  private countClasses(content: string, ext: string): number {
    return (content.match(/^(?:export\s+)?(?:abstract\s+)?class\s+\w+/gm) ?? []).length;
  }

  private countTests(content: string): number {
    // Jest / JUnit / Jasmine
    return (content.match(/(?:it|test|describe|@Test)\s*\(/g) ?? []).length;
  }

  private getLargestFunctionSize(content: string): number {
    // Heurística: contar líneas entre llaves consecutivas de funciones
    // Simplificado para la demo
    const blocks = content.split(/\{/);
    let max = 0;
    for (const block of blocks) {
      const lines = block.split('\n').length;
      if (lines > max) max = lines;
    }
    return max;
  }
}