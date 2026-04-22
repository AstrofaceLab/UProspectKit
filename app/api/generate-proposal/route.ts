import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

// ─── Validate at module load ──────────────────────────────────────────────────
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is not set. AI generation will fail.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30_000,      // 30s hard timeout per request
  maxRetries: 1,         // OpenAI SDK built-in retry
});

const MODEL = "gpt-4.1-mini";
const FREE_LIMIT = 5;

// Rate limit: 10 generations per 60 seconds per user
const RATE_LIMIT_CONFIG = { maxRequests: 10, windowSec: 60 };

export async function POST(req: Request) {
  try {
    // ─── Auth Gate ────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // ─── Rate Limiting ───────────────────────────────────────────────────
    const rateLimitResult = rateLimit(
      `generate:${session.user.id}`,
      RATE_LIMIT_CONFIG
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // ─── Input Validation ────────────────────────────────────────────────
    let body: { jobPost?: string; tone?: string; experience?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { jobPost, tone, experience } = body;

    if (!jobPost || typeof jobPost !== "string" || jobPost.trim().length < 20) {
      return NextResponse.json(
        { error: "Job post is too short. Please paste a full job description." },
        { status: 400 }
      );
    }

    if (jobPost.length > 8000) {
      return NextResponse.json(
        { error: "Job post is too long (max 8,000 characters)." },
        { status: 400 }
      );
    }

    // ─── Usage Controls ──────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true, usageCount: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    if (!user.isPro && user.usageCount >= FREE_LIMIT) {
      return NextResponse.json(
        { error: "Free usage limit exceeded. Please upgrade to Pro." },
        { status: 403 }
      );
    }

    // ─── 4-Step Humanization Pipeline ────────────────────────────────────
    let attempt = 0;
    const maxRetries = 2;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        // Step 1: Deconstruction & Strategy
        const strategyRes = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a cynical, highly-experienced Upwork freelancer. Read the job post, identify the core pain point, and extract only the actual technical requirements. Ignore fluff.",
            },
            { role: "user", content: jobPost },
          ],
          temperature: 0.3,
        });
        const strategy = strategyRes.choices[0].message.content;

        // Step 2: The Raw Draft
        const draftRes = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: `Write a raw Upwork proposal based on the strategy. Tone: ${tone || "Professional"}. Experience: ${experience || "Expert"}. Focus on technical competence.`,
            },
            { role: "user", content: strategy || "" },
          ],
          temperature: 0.7,
        });
        const rawDraft = draftRes.choices[0].message.content;

        // Step 3: The De-Botification Layer
        const filterRes = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: `You are a humanization editor. Rewrite the draft. STRICT NEGATIVE CONSTRAINTS:
- NO hyphenated buzzwords (e.g., remove 'top-notch', 'game-changer', 'fast-paced', 'results-driven').
- NO bullet point lists unless the client explicitly asked for a checklist.
- NO introductory filler (e.g., 'I hope this message finds you well', 'I am writing to apply').
- NO overly enthusiastic punctuation. Remove all exclamation marks (!). Use periods.
- NO robotic transitional phrases (e.g., 'Moreover', 'Furthermore', 'Delve into', 'In conclusion').`,
            },
            { role: "user", content: rawDraft || "" },
          ],
          temperature: 0.5,
        });
        const filteredDraft = filterRes.choices[0].message.content;

        // Step 4: The Casual Polish (Final JSON Output)
        const finalRes = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: `Make this sound like it was typed quickly by a confident expert on a MacBook. 
- Use simple, direct language. 
- Vary sentence length—use very short sentences next to longer ones. 
- Start the hook immediately with a direct answer to their problem.
- Keep the follow-up to exactly one casual sentence.
Return the final output as a strict JSON object: { "hook": "...", "proposal": "...", "followUp": "..." }.`,
            },
            { role: "user", content: filteredDraft || "" },
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
        });

        const resultJson = JSON.parse(
          finalRes.choices[0].message.content || "{}"
        );

        if (resultJson.hook && resultJson.proposal && resultJson.followUp) {
          // Success: Update usage count
          await prisma.user.update({
            where: { id: session.user.id },
            data: { usageCount: { increment: 1 } },
          });

          return NextResponse.json(resultJson);
        }

        throw new Error("AI returned malformed JSON structure");
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        attempt++;
        if (attempt <= maxRetries) {
          console.warn(
            `AI Pipeline attempt ${attempt} failed. Retrying...`,
            lastError.message
          );
        }
      }
    }

    // All retries exhausted — log full error server-side, return safe message
    console.error("AI Pipeline failed after all retries:", lastError);
    return NextResponse.json(
      { error: "AI generation failed. Please try again in a moment." },
      { status: 500 }
    );
  } catch (error) {
    // Catch-all: never leak stack traces to client
    console.error("Unhandled Pipeline Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
