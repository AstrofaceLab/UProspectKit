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

const MODEL = "gpt-4o-mini";
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

    // ─── 2-Step Hyper-Humanization Pipeline ──────────────────────────────
    let attempt = 0;
    const maxRetries = 2;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        // Step 1: The Analyst (Chain of Thought)
        const analystRes = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: "You are an elite, highly-paid freelancer on Upwork. Your goal is to write a proposal that proves you actually read the client's job post. First, silently identify the client's core pain point and exact technical requirements. Then, write the proposal. RULES: Mirror the client's specific vocabulary back to them. Do not just say you have experience; specifically state HOW you will solve their exact problem. Match the requested tone and experience level.",
            },
            { role: "user", content: `Write the proposal draft for this job post:\n\n${jobPost}` },
          ],
          temperature: 0.6,
        });
        const rawDraft = analystRes.choices[0].message.content;

        // Step 2: The De-Botifier (Negative Constraints)
        const debotRes = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: "You are a strict editor. Make this draft sound like a real human typed it quickly but confidently. NEGATIVE CONSTRAINTS (STRICTLY OBEY): 1. NO hyphenated buzzwords (remove top-notch, game-changer, fast-paced, results-driven, detail-oriented). 2. NO robotic transitions (remove Furthermore, Moreover, In conclusion). 3. NO formal filler (Do not start with 'I hope this message finds you well'). 4. NO exclamation marks (!). Use periods. FORMATTING: Use simple, direct, conversational English. Vary sentence length. MUST output strictly as: HOOK: [text] PROPOSAL: [text] FOLLOW_UP: [text].",
            },
            { role: "user", content: `Edit this draft to be 100% human-sounding:\n\n${rawDraft}` },
          ],
          temperature: 0.8,
        });
        const finalDraft = debotRes.choices[0].message.content || "";

        // Robust Regex Parsing
        const hookMatch = finalDraft.match(/HOOK:\s*([\s\S]*?)(?=PROPOSAL:|$)/i);
        const proposalMatch = finalDraft.match(/PROPOSAL:\s*([\s\S]*?)(?=FOLLOW_UP:|$)/i);
        const followUpMatch = finalDraft.match(/FOLLOW_UP:\s*([\s\S]*?)$/i);

        const resultJson = {
          hook: hookMatch?.[1]?.trim() || "",
          proposal: proposalMatch?.[1]?.trim() || "",
          followUp: followUpMatch?.[1]?.trim() || "",
        };

        if (resultJson.hook && resultJson.proposal && resultJson.followUp) {
          // Success: Update usage count
          await prisma.user.update({
            where: { id: session.user.id },
            data: { usageCount: { increment: 1 } },
          });

          return NextResponse.json(resultJson);
        }

        throw new Error("AI output parsing failed - sections missing");
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
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
