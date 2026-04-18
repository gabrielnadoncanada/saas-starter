import "server-only";

import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateObject, generateText } from "ai";
import { z } from "zod";

import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db/prisma";
import { runInTenantScope } from "@/lib/db/tenant-scope";

function resolveModel(modelId: string) {
  if (
    modelId.startsWith("llama") ||
    modelId.startsWith("gpt-oss") ||
    modelId.includes("groq")
  ) {
    if (!process.env.GROQ_API_KEY?.trim()) {
      throw new Error("GROQ_API_KEY is not set");
    }
    return groq(modelId);
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }
  return google(modelId);
}

function resolveJudgeModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
    return google("gemini-2.5-flash");
  }
  if (process.env.GROQ_API_KEY?.trim()) {
    return groq("llama-3.3-70b-versatile");
  }
  throw new Error(
    "No judge model available — set GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY",
  );
}

const judgeSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(1)
    .describe("Quality score from 0 (bad) to 1 (perfect)"),
  passed: z.boolean().describe("Did the candidate meet the bar?"),
  reasoning: z
    .string()
    .max(1000)
    .describe("One or two sentences explaining the score"),
});

async function judge(params: {
  userInput: string;
  candidateOutput: string;
  expectedOutput: string | null;
  criteria: string | null;
}) {
  const { userInput, candidateOutput, expectedOutput, criteria } = params;

  const rubric = [
    expectedOutput
      ? `Expected answer (reference; candidate does not need to match verbatim but should convey the same facts):\n${expectedOutput}`
      : null,
    criteria ? `Additional criteria the answer must satisfy:\n${criteria}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const system = `You are an impartial evaluator of customer-support chatbot answers.
Score the candidate answer from 0 to 1 based on factual accuracy, relevance to the question, and any provided criteria.
Pass (true) only if the answer is factually correct, on-topic, and addresses the user's question. Set score to 0 and passed to false if the candidate hallucinates, dodges, or contradicts the expected answer.`;

  const prompt = `User question:\n${userInput}\n\nCandidate answer:\n${candidateOutput}${
    rubric ? `\n\n${rubric}` : ""
  }`;

  const { object } = await generateObject({
    model: resolveJudgeModel(),
    schema: judgeSchema,
    system,
    prompt,
  });

  return object;
}

type RunOptions = {
  agentId: string;
  agentVersionId?: string;
};

export async function runEval({ agentId, agentVersionId }: RunOptions) {
  const membership = await requireActiveOrganizationMembership();
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const agent = await db.agent.findFirst({
    where: { id: agentId },
    include: {
      versions: agentVersionId
        ? { where: { id: agentVersionId }, take: 1 }
        : { where: { active: true }, orderBy: { version: "desc" }, take: 1 },
    },
  });
  if (!agent) throw new Error("Agent not found");

  const version = agent.versions[0] ?? null;
  if (!version) throw new Error("No active prompt version — activate one first");

  const cases = await db.evalCase.findMany({
    where: { agentId, enabled: true },
    orderBy: { createdAt: "asc" },
  });
  if (cases.length === 0) {
    throw new Error("No enabled eval cases — add at least one case first");
  }

  const run = await db.evalRun.create({
    data: {
      organizationId: membership.organizationId,
      agentId,
      agentVersionId: version.id,
      status: "RUNNING",
      totalCases: cases.length,
      triggeredByUserId: user.id,
    },
  });

  let passed = 0;
  let scoreSum = 0;
  const orgId = membership.organizationId;

  try {
    for (const c of cases) {
      const startedAt = Date.now();
      let candidate = "";
      let judgeResult: z.infer<typeof judgeSchema> | null = null;
      try {
        const generated = await generateText({
          model: resolveModel(agent.modelId),
          system: version.systemPrompt,
          prompt: c.input,
        });
        candidate = generated.text;
        judgeResult = await judge({
          userInput: c.input,
          candidateOutput: candidate,
          expectedOutput: c.expectedOutput,
          criteria: c.criteria,
        });
      } catch (error) {
        judgeResult = {
          score: 0,
          passed: false,
          reasoning:
            error instanceof Error
              ? `Run failed: ${error.message}`
              : "Run failed",
        };
      }

      const latencyMs = Date.now() - startedAt;
      if (judgeResult.passed) passed += 1;
      scoreSum += judgeResult.score;

      await runInTenantScope(orgId, () =>
        db.evalResult.create({
          data: {
            runId: run.id,
            caseId: c.id,
            output: candidate,
            score: judgeResult!.score,
            passed: judgeResult!.passed,
            reasoning: judgeResult!.reasoning,
            latencyMs,
          },
        }),
      );
    }

    const averageScore = scoreSum / cases.length;
    await db.evalRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        passedCases: passed,
        averageScore,
        completedAt: new Date(),
      },
    });
    await db.agentVersion.update({
      where: { id: version.id },
      data: { evalScore: averageScore },
    });

    return { runId: run.id, totalCases: cases.length, passed, averageScore };
  } catch (error) {
    await db.evalRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Run failed",
        completedAt: new Date(),
      },
    });
    throw error;
  }
}
