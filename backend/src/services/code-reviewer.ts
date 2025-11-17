import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { CodeReview, CodeReviewIssue, ReviewSeverity } from '@local-code-agent/shared';
import { db } from '../database';
import { createProvider } from '../providers';

export async function performCodeReview(
  agentId: string,
  projectId: string,
  projectPath: string,
  files?: string[],
  focus?: string[]
): Promise<CodeReview> {

  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId) as any;
  if (!agent) {
    throw new Error('Agent not found');
  }

  // Determine files to review
  const filesToReview = files || await getProjectFiles(projectPath);

  // Read file contents
  const fileContents: Record<string, string> = {};
  for (const file of filesToReview) {
    try {
      const fullPath = path.join(projectPath, file);
      fileContents[file] = await fs.promises.readFile(fullPath, 'utf-8');
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  // Create AI provider
  const provider = createProvider(agent.provider, agent.api_key, agent.base_url);

  // Build review prompt
  const prompt = buildReviewPrompt(fileContents, focus);

  // Get review from AI
  const messages = [
    {
      role: 'system' as const,
      content: `You are an expert code reviewer. Analyze code for security issues, bugs, performance problems, and best practices. Return your analysis in JSON format with the following structure:
{
  "issues": [
    {
      "file": "filename",
      "line": number,
      "severity": "info|warning|error|critical",
      "category": "security|performance|bug|style|best-practice",
      "message": "description",
      "suggestion": "how to fix"
    }
  ],
  "summary": "overall assessment",
  "score": number (0-100)
}`,
    },
    {
      role: 'user' as const,
      content: prompt,
    },
  ];

  const response = await provider.chat({
    messages,
    model: agent.model,
    maxTokens: agent.max_tokens || 4096,
    temperature: 0.3, // Lower temperature for more consistent reviews
  });

  // Parse response
  const reviewData = parseReviewResponse(response.content);

  const review: CodeReview = {
    id: uuidv4(),
    agentId,
    projectId,
    files: filesToReview,
    issues: reviewData.issues,
    summary: reviewData.summary,
    score: reviewData.score,
    createdAt: new Date(),
  };

  return review;
}

function buildReviewPrompt(fileContents: Record<string, string>, focus?: string[]): string {
  let prompt = 'Please review the following code files:\n\n';

  for (const [file, content] of Object.entries(fileContents)) {
    prompt += `File: ${file}\n\`\`\`\n${content}\n\`\`\`\n\n`;
  }

  if (focus && focus.length > 0) {
    prompt += `\nFocus areas: ${focus.join(', ')}\n`;
  }

  prompt += '\nProvide your code review in the specified JSON format.';

  return prompt;
}

function parseReviewResponse(content: string): {
  issues: CodeReviewIssue[];
  summary: string;
  score: number;
} {
  try {
    // Try to extract JSON from markdown code block
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;

    const parsed = JSON.parse(jsonStr);

    // Convert to our format
    const issues: CodeReviewIssue[] = (parsed.issues || []).map((issue: any) => ({
      id: uuidv4(),
      file: issue.file,
      line: issue.line || 1,
      column: issue.column,
      severity: issue.severity as ReviewSeverity,
      category: issue.category,
      message: issue.message,
      suggestion: issue.suggestion,
      code: issue.code,
    }));

    return {
      issues,
      summary: parsed.summary || 'No summary provided',
      score: Math.max(0, Math.min(100, parsed.score || 50)),
    };
  } catch (error) {
    console.error('Error parsing review response:', error);

    // Return a basic review if parsing fails
    return {
      issues: [],
      summary: 'Failed to parse code review response',
      score: 50,
    };
  }
}

async function getProjectFiles(projectPath: string): Promise<string[]> {
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
        // Only include code files
        const ext = path.extname(entry).toLowerCase();
        if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c'].includes(ext)) {
          files.push(relativePath);
        }
      }
    }
  }

  await walk(projectPath, projectPath);

  return files.slice(0, 20); // Limit to 20 files for now
}
