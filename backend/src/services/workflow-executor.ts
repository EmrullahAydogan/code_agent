import { Server as SocketIOServer } from 'socket.io';
import { Workflow, WorkflowType, WorkflowStepStatus } from '@local-code-agent/shared';
import { db } from '../database';
import { createProvider } from '../providers';

export async function executeWorkflow(workflow: Workflow, io: SocketIOServer) {
  try {
    console.log(`Executing workflow: ${workflow.name} (${workflow.type})`);

    switch (workflow.type) {
      case WorkflowType.SEQUENTIAL:
        await executeSequential(workflow, io);
        break;
      case WorkflowType.PARALLEL:
        await executeParallel(workflow, io);
        break;
      case WorkflowType.CONDITIONAL:
        await executeConditional(workflow, io);
        break;
      case WorkflowType.LOOP:
        await executeLoop(workflow, io);
        break;
      default:
        throw new Error(`Unknown workflow type: ${workflow.type}`);
    }

    // Mark workflow as completed
    db.prepare(`
      UPDATE workflows
      SET status = ?, completed_at = ?, steps = ?
      WHERE id = ?
    `).run('completed', Date.now(), JSON.stringify(workflow.steps), workflow.id);

    console.log(`Workflow completed: ${workflow.name}`);
  } catch (error: any) {
    console.error(`Workflow failed: ${workflow.name}`, error);

    // Mark workflow as failed
    db.prepare(`
      UPDATE workflows
      SET status = ?, error = ?, completed_at = ?, steps = ?
      WHERE id = ?
    `).run('failed', error.message, Date.now(), JSON.stringify(workflow.steps), workflow.id);
  }
}

async function executeSequential(workflow: Workflow, io: SocketIOServer) {
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];

    // Update current step index
    db.prepare('UPDATE workflows SET current_step_index = ? WHERE id = ?').run(i, workflow.id);

    // Execute step
    await executeStep(workflow, step, io);

    // If step failed, stop execution
    if (step.status === WorkflowStepStatus.FAILED) {
      throw new Error(`Step "${step.name}" failed: ${step.error}`);
    }
  }
}

async function executeParallel(workflow: Workflow, io: SocketIOServer) {
  // Execute all steps in parallel
  const promises = workflow.steps.map(step => executeStep(workflow, step, io));

  await Promise.all(promises);

  // Check if any step failed
  const failedStep = workflow.steps.find(s => s.status === WorkflowStepStatus.FAILED);
  if (failedStep) {
    throw new Error(`Step "${failedStep.name}" failed: ${failedStep.error}`);
  }
}

async function executeConditional(workflow: Workflow, io: SocketIOServer) {
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];

    // Check condition if present
    if (step.condition) {
      try {
        // Safely evaluate condition
        const shouldExecute = evaluateCondition(step.condition, workflow);
        if (!shouldExecute) {
          step.status = WorkflowStepStatus.SKIPPED;
          continue;
        }
      } catch (error: any) {
        step.status = WorkflowStepStatus.FAILED;
        step.error = `Condition evaluation failed: ${error.message}`;
        throw error;
      }
    }

    await executeStep(workflow, step, io);

    if (step.status === WorkflowStepStatus.FAILED) {
      throw new Error(`Step "${step.name}" failed: ${step.error}`);
    }
  }
}

async function executeLoop(workflow: Workflow, io: SocketIOServer) {
  const maxIterations = 10; // Safety limit
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    // Execute all steps
    for (const step of workflow.steps) {
      await executeStep(workflow, step, io);

      if (step.status === WorkflowStepStatus.FAILED) {
        throw new Error(`Step "${step.name}" failed in iteration ${iteration}: ${step.error}`);
      }
    }

    // Check if loop should continue
    // This would typically be based on some condition in the workflow
    // For now, we'll just do one iteration
    break;
  }
}

async function executeStep(workflow: Workflow, step: any, io: SocketIOServer) {
  try {
    console.log(`Executing step: ${step.name}`);

    step.status = WorkflowStepStatus.RUNNING;
    step.startedAt = new Date();

    // Get agent
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(step.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${step.agentId}`);
    }

    // Create AI provider
    const provider = createProvider(
      (agent as any).provider,
      (agent as any).api_key,
      (agent as any).base_url
    );

    // Build messages
    const messages = [];
    if ((agent as any).system_prompt) {
      messages.push({
        role: 'system' as const,
        content: (agent as any).system_prompt,
      });
    }

    // Add context from previous steps
    const contextMessage = buildContextFromPreviousSteps(workflow, step);
    if (contextMessage) {
      messages.push({
        role: 'system' as const,
        content: contextMessage,
      });
    }

    messages.push({
      role: 'user' as const,
      content: step.prompt,
    });

    // Execute
    const response = await provider.chat({
      messages,
      model: (agent as any).model,
      maxTokens: (agent as any).max_tokens || 4096,
      temperature: (agent as any).temperature || 0.7,
    });

    step.result = response.content;
    step.status = WorkflowStepStatus.COMPLETED;
    step.completedAt = new Date();

    console.log(`Step completed: ${step.name}`);

    // Emit progress
    io.emit('workflow:progress', {
      workflowId: workflow.id,
      step,
    });

  } catch (error: any) {
    console.error(`Step failed: ${step.name}`, error);
    step.status = WorkflowStepStatus.FAILED;
    step.error = error.message;
    step.completedAt = new Date();

    throw error;
  }
}

function buildContextFromPreviousSteps(workflow: Workflow, currentStep: any): string | null {
  if (!currentStep.dependsOn || currentStep.dependsOn.length === 0) {
    return null;
  }

  const context: string[] = ['Context from previous steps:'];

  for (const stepId of currentStep.dependsOn) {
    const prevStep = workflow.steps.find(s => s.id === stepId);
    if (prevStep && prevStep.result) {
      context.push(`\n${prevStep.name}: ${prevStep.result}`);
    }
  }

  return context.join('\n');
}

function evaluateCondition(condition: string, workflow: Workflow): boolean {
  // Simple condition evaluation
  // In a real implementation, use a safe expression evaluator
  // For now, we'll check if a previous step succeeded

  try {
    // Example: "step1.status === 'completed'"
    // For safety, we'll just return true for now
    // In production, use a proper expression evaluator library
    return true;
  } catch (error) {
    console.error('Condition evaluation error:', error);
    return false;
  }
}
