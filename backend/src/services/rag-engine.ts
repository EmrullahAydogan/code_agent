import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { DocumentChunk, SearchResult } from '@local-code-agent/shared';
import { db } from '../database';

export async function indexProject(
  kbId: string,
  projectId: string,
  projectPath: string,
  files?: string[]
): Promise<void> {
  try {
    const filesToIndex = files || await getCodeFiles(projectPath);

    let totalDocuments = 0;
    let totalChunks = 0;

    for (const file of filesToIndex) {
      const fullPath = path.join(projectPath, file);

      try {
        const content = await fs.promises.readFile(fullPath, 'utf-8');
        const chunks = chunkDocument(content, file);

        // Save chunks to database
        for (const chunk of chunks) {
          db.prepare(`
            INSERT INTO document_chunks (
              id, knowledge_base_id, content, metadata, created_at
            ) VALUES (?, ?, ?, ?, ?)
          `).run(
            chunk.id,
            kbId,
            chunk.content,
            JSON.stringify(chunk.metadata),
            chunk.createdAt.getTime()
          );

          totalChunks++;
        }

        totalDocuments++;
      } catch (error) {
        console.error(`Error indexing file ${file}:`, error);
      }
    }

    // Update knowledge base
    db.prepare(`
      UPDATE knowledge_bases
      SET documents = ?, chunks = ?, indexed = 1, indexed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(totalDocuments, totalChunks, Date.now(), Date.now(), kbId);

    console.log(`Indexed ${totalDocuments} documents with ${totalChunks} chunks`);
  } catch (error: any) {
    console.error('Indexing error:', error);
    throw error;
  }
}

export async function searchKnowledgeBase(
  kbId: string,
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  // Get all chunks for this knowledge base
  const chunks = db.prepare(`
    SELECT * FROM document_chunks
    WHERE knowledge_base_id = ?
  `).all(kbId) as any[];

  // Simple text-based search (in production, use vector embeddings)
  const results: SearchResult[] = [];

  for (const chunkRow of chunks) {
    const chunk: DocumentChunk = {
      id: chunkRow.id,
      content: chunkRow.content,
      metadata: JSON.parse(chunkRow.metadata),
      createdAt: new Date(chunkRow.created_at),
    };

    // Calculate simple relevance score based on keyword matching
    const score = calculateRelevanceScore(query, chunk.content);

    if (score > 0) {
      results.push({
        chunk,
        score,
      });
    }
  }

  // Sort by score and limit results
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

function chunkDocument(content: string, file: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const lines = content.split('\n');
  const chunkSize = 50; // Lines per chunk

  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunkLines = lines.slice(i, i + chunkSize);
    const chunkContent = chunkLines.join('\n');

    chunks.push({
      id: uuidv4(),
      content: chunkContent,
      metadata: {
        file,
        startLine: i + 1,
        endLine: i + chunkLines.length,
        language: path.extname(file).slice(1),
      },
      createdAt: new Date(),
    });
  }

  return chunks;
}

function calculateRelevanceScore(query: string, content: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();

  let score = 0;

  for (const term of queryTerms) {
    if (term.length < 2) continue;

    // Count occurrences
    const regex = new RegExp(term, 'gi');
    const matches = contentLower.match(regex);

    if (matches) {
      score += matches.length;
    }
  }

  return score;
}

async function getCodeFiles(projectPath: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(dir: string, baseDir: string) {
    const entries = await fs.promises.readdir(dir);

    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') {
        continue;
      }

      const fullPath = path.join(dir, entry);
      const relativePath = path.relative(baseDir, fullPath);
      const stat = await fs.promises.stat(fullPath);

      if (stat.isDirectory()) {
        await walk(fullPath, baseDir);
      } else if (stat.isFile()) {
        const ext = path.extname(entry).toLowerCase();
        if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.md'].includes(ext)) {
          files.push(relativePath);
        }
      }
    }
  }

  await walk(projectPath, projectPath);

  return files;
}
