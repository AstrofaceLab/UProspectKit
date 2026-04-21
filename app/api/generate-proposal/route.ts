import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "gpt-5.0-mini";
const FREE_LIMIT = 5;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { jobPost, tone, experience } = await req.json();

    if (!jobPost || jobPost.length < 20) {
      return NextResponse.json(
        { error: "Job post too short" },
        { status: 400 }
      );
    }

    // ─── Usage Controls ───
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true, usageCount: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (!user.isPro && user.usageCount >= FREE_LIMIT) {
      return NextResponse.json(
        { error: "Free usage limit exceeded. Please upgrade to Pro." },
        { status: 403 }
      );
    }

    // ─── 4-Step Humanization Pipeline ───
    let attempt = 0;
    const maxRetries = 2;
    let lastError = null;

    while (attempt <= maxRetries) {
      try {
        // Step 1: Deconstruction & Strategy
        const strategyRes = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            { 
              role: "system", 
              content: "You are a cynical, highly-experienced Upwork freelancer. Read the job post, identify the core pain point, and extract only the actual technical requirements. Ignore fluff." 
            },
            { role: "user", content: jobPost }
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
              content: `Write a raw Upwork proposal based on the strategy. Tone: ${tone}. Experience: ${experience}. Focus on technical competence.` 
            },
            { role: "user", content: strategy || "" }
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
- NO robotic transitional phrases (e.g., 'Moreover', 'Furthermore', 'Delve into', 'In conclusion').` 
            },
            { role: "user", content: rawDraft || "" }
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
Return the final output as a strict JSON object: { "hook": "...", "proposal": "...", "followUp": "..." }.` 
            },
            { role: "user", content: filteredDraft || "" }
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
        });

        const resultJson = JSON.parse(finalRes.choices[0].message.content || "{}");
        
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
        lastError = err;
        attempt++;
        console.warn(`AI Pipeline attempt ${attempt} failed. Retrying...`, err);
      }
    }

    throw lastError || new Error("AI Pipeline failed after maximum retries");

  } catch (error: any) {
    console.error("Pipeline Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
