import { Octokit } from '@octokit/rest';
import { GitRepositoryPort } from '../../domain/ports/GitRepositoryPort';
import { RepositoryFile, ParsedRepo } from '../../domain/value-objects';
import { ALLOWED_EXTENSIONS, IGNORED_DIRS } from '../config/analizer.config';

export class GithubRepositoryAdapter implements GitRepositoryPort {
  private client: Octokit;

  constructor(token?: string) {
    this.client = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
    });
  }

  async getFiles(repoUrl: string): Promise<RepositoryFile[]> {
    const { owner, repo } = this.parseRepoUrl(repoUrl);

    // 1 sola llamada trae todo el árbol del repo
    const { data: refData } = await this.client.rest.repos.get({ owner, repo });
    const defaultBranch = refData.default_branch;

    const { data: treeData } = await this.client.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: '1', // traemos el árbol completo en 1 request
    });

    // Filtrar solo archivos relevantes (type === 'blob' = archivo)
    const relevantPaths = treeData.tree.filter((item) => {
      if (item.type !== 'blob' || !item.path) return false;

      const isIgnored = IGNORED_DIRS.some((dir) =>
        item.path!.split('/').includes(dir),
      );
      const ext = this.getExtension(item.path);
      const isAllowed = ALLOWED_EXTENSIONS.includes(ext);

      return !isIgnored && isAllowed;
    });

    // Obtener contenido en batches para no saturar el rate limit
    const files = await this.fetchInBatches(
      relevantPaths.map((i) => i.path!),
      owner,
      repo,
      10, // batch size
    );

    return files;
  }

  // Divide las rutas en grupos y las procesa concurrentemente por grupo
  private async fetchInBatches(
    paths: string[],
    owner: string,
    repo: string,
    batchSize: number,
  ): Promise<RepositoryFile[]> {
    const results: RepositoryFile[] = [];

    for (let i = 0; i < paths.length; i += batchSize) {
      const batch = paths.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map((path) => this.fetchFile(owner, repo, path)),
      );

      // Filtra nulls (archivos que fallaron silenciosamente)
      results.push(
        ...batchResults.filter((f): f is RepositoryFile => f !== null),
      );
    }

    return results;
  }

  private async fetchFile(
    owner: string,
    repo: string,
    path: string,
  ): Promise<RepositoryFile | null> {
    try {
      const { data } = await this.client.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      // getContent puede devolver array (directorio) o objeto (archivo)
      if (Array.isArray(data) || data.type !== 'file') return null;

      // GitHub devuelve el contenido en base64
      const content = Buffer.from(data.content, 'base64').toString('utf-8');

      return {
        path,
        content,
        extension: this.getExtension(path),
      };
    } catch {
      // Archivo inaccesible o muy grande (>1MB) → ignorar
      return null;
    }
  }

  // Soporta: https://github.com/owner/repo  y  https://github.com/owner/repo.git
  private parseRepoUrl(url: string): ParsedRepo {
    const clean = url.replace(/\.git$/, '').replace(/\/$/, '');
    const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/);

    if (!match) {
      throw new Error(
        `Invalid GitHub URL: ${url}. Expected format: https://github.com/owner/repo`,
      );
    }

    return { owner: match[1], repo: match[2] };
  }

  private getExtension(path: string): string {
    const dot = path.lastIndexOf('.');
    return dot !== -1 ? path.slice(dot) : '';
  }
}
