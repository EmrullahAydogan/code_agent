import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  ToolType,
  ToolCall,
  ToolResult,
  FileContent,
  FileSearchResult,
  DirectoryListing,
  GitStatus,
  GitDiff,
  CommandExecution,
} from '@local-code-agent/shared';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export class ToolExecutor {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    try {
      let result: any;

      switch (toolCall.type) {
        case ToolType.READ_FILE:
          result = await this.readFile(toolCall.arguments.path);
          break;
        case ToolType.WRITE_FILE:
          result = await this.writeFile(toolCall.arguments.path, toolCall.arguments.content);
          break;
        case ToolType.EDIT_FILE:
          result = await this.editFile(
            toolCall.arguments.path,
            toolCall.arguments.search,
            toolCall.arguments.replace
          );
          break;
        case ToolType.DELETE_FILE:
          result = await this.deleteFile(toolCall.arguments.path);
          break;
        case ToolType.LIST_FILES:
          result = await this.listFiles(toolCall.arguments.path || '.');
          break;
        case ToolType.SEARCH_FILES:
          result = await this.searchFiles(toolCall.arguments.pattern);
          break;
        case ToolType.SEARCH_CODE:
          result = await this.searchCode(toolCall.arguments.query, toolCall.arguments.filePattern);
          break;
        case ToolType.EXECUTE_COMMAND:
          result = await this.executeCommand(toolCall.arguments.command);
          break;
        case ToolType.GIT_STATUS:
          result = await this.gitStatus();
          break;
        case ToolType.GIT_DIFF:
          result = await this.gitDiff(toolCall.arguments.file);
          break;
        case ToolType.GIT_COMMIT:
          result = await this.gitCommit(toolCall.arguments.message, toolCall.arguments.files);
          break;
        case ToolType.GIT_PUSH:
          result = await this.gitPush(toolCall.arguments.remote, toolCall.arguments.branch);
          break;
        case ToolType.GIT_PULL:
          result = await this.gitPull(toolCall.arguments.remote, toolCall.arguments.branch);
          break;
        case ToolType.CREATE_DIRECTORY:
          result = await this.createDirectory(toolCall.arguments.path);
          break;
        case ToolType.MOVE_FILE:
          result = await this.moveFile(toolCall.arguments.source, toolCall.arguments.destination);
          break;
        case ToolType.COPY_FILE:
          result = await this.copyFile(toolCall.arguments.source, toolCall.arguments.destination);
          break;
        default:
          throw new Error(`Unknown tool type: ${toolCall.type}`);
      }

      return {
        id: toolCall.id,
        success: true,
        result,
      };
    } catch (error: any) {
      return {
        id: toolCall.id,
        success: false,
        error: error.message,
      };
    }
  }

  private getAbsolutePath(relativePath: string): string {
    return path.resolve(this.projectPath, relativePath);
  }

  // File Operations
  private async readFile(filePath: string): Promise<FileContent> {
    const absolutePath = this.getAbsolutePath(filePath);
    const content = await fs.promises.readFile(absolutePath, 'utf-8');
    const stats = await fs.promises.stat(absolutePath);
    const ext = path.extname(filePath).slice(1);

    return {
      path: filePath,
      content,
      language: ext,
      size: stats.size,
      lastModified: stats.mtime,
    };
  }

  private async writeFile(filePath: string, content: string): Promise<{ success: boolean }> {
    const absolutePath = this.getAbsolutePath(filePath);
    const dir = path.dirname(absolutePath);

    // Ensure directory exists
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(absolutePath, content, 'utf-8');

    return { success: true };
  }

  private async editFile(filePath: string, search: string, replace: string): Promise<{ success: boolean; changes: number }> {
    const absolutePath = this.getAbsolutePath(filePath);
    let content = await fs.promises.readFile(absolutePath, 'utf-8');

    const regex = new RegExp(search, 'g');
    const matches = content.match(regex);
    const changes = matches ? matches.length : 0;

    content = content.replace(regex, replace);
    await fs.promises.writeFile(absolutePath, content, 'utf-8');

    return { success: true, changes };
  }

  private async deleteFile(filePath: string): Promise<{ success: boolean }> {
    const absolutePath = this.getAbsolutePath(filePath);
    await fs.promises.unlink(absolutePath);
    return { success: true };
  }

  private async listFiles(dirPath: string): Promise<DirectoryListing> {
    const absolutePath = this.getAbsolutePath(dirPath);
    return await this.buildDirectoryTree(absolutePath, dirPath);
  }

  private async buildDirectoryTree(absolutePath: string, relativePath: string): Promise<DirectoryListing> {
    const stats = await fs.promises.stat(absolutePath);
    const name = path.basename(absolutePath);

    if (stats.isFile()) {
      return {
        path: relativePath,
        name,
        type: 'file',
        size: stats.size,
        lastModified: stats.mtime,
      };
    }

    const entries = await fs.promises.readdir(absolutePath);
    const children: DirectoryListing[] = [];

    for (const entry of entries) {
      // Skip common ignored directories
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') {
        continue;
      }

      const entryAbsolute = path.join(absolutePath, entry);
      const entryRelative = path.join(relativePath, entry);

      try {
        const child = await this.buildDirectoryTree(entryAbsolute, entryRelative);
        children.push(child);
      } catch (error) {
        // Skip files we can't access
        continue;
      }
    }

    return {
      path: relativePath,
      name,
      type: 'directory',
      children,
    };
  }

  private async searchFiles(pattern: string): Promise<string[]> {
    const files: string[] = [];
    await this.walkDirectory(this.projectPath, '', pattern, files);
    return files;
  }

  private async walkDirectory(absoluteBase: string, relativePath: string, pattern: string, results: string[]) {
    const entries = await fs.promises.readdir(path.join(absoluteBase, relativePath));

    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') {
        continue;
      }

      const entryRelative = path.join(relativePath, entry);
      const entryAbsolute = path.join(absoluteBase, entryRelative);

      try {
        const stats = await fs.promises.stat(entryAbsolute);

        if (stats.isDirectory()) {
          await this.walkDirectory(absoluteBase, entryRelative, pattern, results);
        } else if (stats.isFile() && entry.includes(pattern)) {
          results.push(entryRelative);
        }
      } catch (error) {
        continue;
      }
    }
  }

  private async searchCode(query: string, filePattern?: string): Promise<FileSearchResult[]> {
    const results: FileSearchResult[] = [];
    await this.searchInDirectory(this.projectPath, '', query, filePattern, results);
    return results;
  }

  private async searchInDirectory(
    absoluteBase: string,
    relativePath: string,
    query: string,
    filePattern: string | undefined,
    results: FileSearchResult[]
  ) {
    const entries = await fs.promises.readdir(path.join(absoluteBase, relativePath));

    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') {
        continue;
      }

      const entryRelative = path.join(relativePath, entry);
      const entryAbsolute = path.join(absoluteBase, entryRelative);

      try {
        const stats = await fs.promises.stat(entryAbsolute);

        if (stats.isDirectory()) {
          await this.searchInDirectory(absoluteBase, entryRelative, query, filePattern, results);
        } else if (stats.isFile()) {
          if (filePattern && !entry.match(filePattern)) {
            continue;
          }

          try {
            const content = await fs.promises.readFile(entryAbsolute, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
              const column = line.indexOf(query);
              if (column !== -1) {
                results.push({
                  path: entryRelative,
                  line: index + 1,
                  column,
                  match: query,
                  context: line.trim(),
                });
              }
            });
          } catch (error) {
            // Skip binary files or files we can't read
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  // Command Execution
  private async executeCommand(command: string): Promise<CommandExecution> {
    const id = uuidv4();
    const startedAt = new Date();

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return {
        id,
        command,
        workingDirectory: this.projectPath,
        status: 'completed',
        output: stdout + stderr,
        exitCode: 0,
        startedAt,
        completedAt: new Date(),
      };
    } catch (error: any) {
      return {
        id,
        command,
        workingDirectory: this.projectPath,
        status: 'failed',
        output: error.stdout || '',
        error: error.stderr || error.message,
        exitCode: error.code || 1,
        startedAt,
        completedAt: new Date(),
      };
    }
  }

  // Git Operations
  private async gitStatus(): Promise<GitStatus> {
    const { stdout } = await execAsync('git status --porcelain -b', { cwd: this.projectPath });
    const lines = stdout.split('\n').filter(line => line.trim());

    const branch = lines[0].match(/## (.+?)(?:\.\.\.|$)/)?.[1] || 'unknown';
    const staged: string[] = [];
    const unstaged: string[] = [];
    const untracked: string[] = [];

    for (const line of lines.slice(1)) {
      const status = line.slice(0, 2);
      const file = line.slice(3);

      if (status.includes('?')) {
        untracked.push(file);
      } else if (status[0] !== ' ') {
        staged.push(file);
      } else if (status[1] !== ' ') {
        unstaged.push(file);
      }
    }

    // Get ahead/behind counts
    let ahead = 0;
    let behind = 0;
    try {
      const { stdout: revList } = await execAsync('git rev-list --left-right --count HEAD...@{upstream}', {
        cwd: this.projectPath,
      });
      const counts = revList.trim().split('\t');
      ahead = parseInt(counts[0]) || 0;
      behind = parseInt(counts[1]) || 0;
    } catch (error) {
      // No upstream or not a git repo
    }

    return { branch, ahead, behind, staged, unstaged, untracked };
  }

  private async gitDiff(file?: string): Promise<GitDiff[]> {
    const command = file ? `git diff ${file}` : 'git diff';
    const { stdout } = await execAsync(command, { cwd: this.projectPath });

    const diffs: GitDiff[] = [];
    const fileBlocks = stdout.split('diff --git');

    for (const block of fileBlocks) {
      if (!block.trim()) continue;

      const fileMatch = block.match(/a\/(.+?) b\//);
      if (!fileMatch) continue;

      const file = fileMatch[1];
      const additions = (block.match(/^\+/gm) || []).length;
      const deletions = (block.match(/^-/gm) || []).length;

      diffs.push({
        file,
        additions,
        deletions,
        changes: block,
      });
    }

    return diffs;
  }

  private async gitCommit(message: string, files?: string[]): Promise<{ success: boolean; hash: string }> {
    if (files && files.length > 0) {
      await execAsync(`git add ${files.join(' ')}`, { cwd: this.projectPath });
    } else {
      await execAsync('git add -A', { cwd: this.projectPath });
    }

    const { stdout } = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
      cwd: this.projectPath,
    });

    const hashMatch = stdout.match(/\[.+? ([a-f0-9]+)\]/);
    const hash = hashMatch ? hashMatch[1] : 'unknown';

    return { success: true, hash };
  }

  private async gitPush(remote?: string, branch?: string): Promise<{ success: boolean }> {
    const command = `git push ${remote || 'origin'} ${branch || ''}`.trim();
    await execAsync(command, { cwd: this.projectPath });
    return { success: true };
  }

  private async gitPull(remote?: string, branch?: string): Promise<{ success: boolean }> {
    const command = `git pull ${remote || 'origin'} ${branch || ''}`.trim();
    await execAsync(command, { cwd: this.projectPath });
    return { success: true };
  }

  // File Management
  private async createDirectory(dirPath: string): Promise<{ success: boolean }> {
    const absolutePath = this.getAbsolutePath(dirPath);
    await fs.promises.mkdir(absolutePath, { recursive: true });
    return { success: true };
  }

  private async moveFile(source: string, destination: string): Promise<{ success: boolean }> {
    const sourceAbsolute = this.getAbsolutePath(source);
    const destAbsolute = this.getAbsolutePath(destination);
    await fs.promises.rename(sourceAbsolute, destAbsolute);
    return { success: true };
  }

  private async copyFile(source: string, destination: string): Promise<{ success: boolean }> {
    const sourceAbsolute = this.getAbsolutePath(source);
    const destAbsolute = this.getAbsolutePath(destination);
    await fs.promises.copyFile(sourceAbsolute, destAbsolute);
    return { success: true };
  }
}
