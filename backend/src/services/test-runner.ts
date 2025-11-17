import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { TestCase, TestSuite } from '@local-code-agent/shared';
import { db } from '../database';
import { createProvider } from '../providers';

const execAsync = promisify(exec);

export async function generateTests(
  agentId: string,
  projectId: string,
  projectPath: string,
  filePath?: string
): Promise<TestCase[]> {
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId) as any;
  if (!agent) {
    throw new Error('Agent not found');
  }

  // Read target file
  let code = '';
  if (filePath) {
    const fullPath = path.join(projectPath, filePath);
    code = await fs.promises.readFile(fullPath, 'utf-8');
  }

  // Create AI provider
  const provider = createProvider(agent.provider, agent.api_key, agent.base_url);

  const prompt = `Generate unit tests for the following code. Return a JSON array of test cases with this structure:
[
  {
    "name": "test name",
    "description": "what it tests",
    "code": "test code",
    "expectedOutput": "expected result"
  }
]

Code to test:
\`\`\`
${code}
\`\`\`

Generate comprehensive unit tests covering normal cases, edge cases, and error handling.`;

  const messages = [
    {
      role: 'system' as const,
      content: 'You are an expert test engineer. Generate thorough, well-structured unit tests.',
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
    temperature: 0.3,
  });

  // Parse response
  try {
    const jsonMatch = response.content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response.content;
    const parsed = JSON.parse(jsonStr);

    return parsed.map((test: any) => ({
      id: uuidv4(),
      name: test.name,
      description: test.description,
      code: test.code,
      expectedOutput: test.expectedOutput,
      status: 'pending' as const,
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error('Error parsing test generation response:', error);
    return [];
  }
}

export async function executeTests(suite: TestSuite): Promise<void> {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(suite.projectId) as any;
    if (!project) {
      throw new Error('Project not found');
    }

    let passed = 0;
    let failed = 0;

    for (const testCase of suite.testCases) {
      try {
        testCase.status = 'running';
        const startTime = Date.now();

        // Write test to temporary file
        const testFile = path.join(project.path, `temp_test_${testCase.id}.test.js`);
        await fs.promises.writeFile(testFile, testCase.code);

        // Execute test (this is a simplified version)
        // In production, use proper test runners like Jest, Mocha, etc.
        try {
          const { stdout, stderr } = await execAsync(`node ${testFile}`, {
            cwd: project.path,
            timeout: 10000,
          });

          testCase.status = 'passed';
          testCase.duration = Date.now() - startTime;
          passed++;
        } catch (execError: any) {
          testCase.status = 'failed';
          testCase.error = execError.message;
          testCase.duration = Date.now() - startTime;
          failed++;
        }

        // Clean up test file
        try {
          await fs.promises.unlink(testFile);
        } catch (e) {
          // Ignore cleanup errors
        }

        testCase.runAt = new Date();
      } catch (error: any) {
        testCase.status = 'failed';
        testCase.error = error.message;
        failed++;
      }
    }

    // Update suite
    db.prepare(`
      UPDATE test_suites
      SET status = ?, test_cases = ?, passed_tests = ?, failed_tests = ?, completed_at = ?
      WHERE id = ?
    `).run(
      'completed',
      JSON.stringify(suite.testCases),
      passed,
      failed,
      Date.now(),
      suite.id
    );

  } catch (error: any) {
    console.error('Test suite execution error:', error);

    db.prepare(`
      UPDATE test_suites
      SET status = ?, completed_at = ?
      WHERE id = ?
    `).run('failed', Date.now(), suite.id);
  }
}
