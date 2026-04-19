import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "gpt-4o-mini";

export async function POST(req: Request) {
  try {
    const { jobPost, tone, experience } = await req.json();

    if (!jobPost || jobPost.length < 20) {
      return NextResponse.json(
        { error: "Job post too short" },
        { status: 400 }
      );
    }

    // PHASE 1: DRAFT GENERATION
    const draftCompletion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a skilled freelancer writing an Upwork proposal. Write a clear, relevant proposal based strictly on the job post. Avoid being overly generic, but focus on getting a solid draft down.",
        },
        {
          role: "user",
          content: `Write an Upwork proposal based on this job post.\n\nJob post:\n${jobPost}\n\nTone:\n${tone}\n\nExperience level:\n${experience}\n\nReturn EXACT format:\n\nHOOK:\nPROPOSAL:\nFOLLOW_UP:`,
        },
      ],
      temperature: 0.7,
    });

    const draftText = draftCompletion.choices[0].message.content || "";

    // PHASE 2: REWRITE (IMPROVEMENT)
    const improvedCompletion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Improve this proposal: Make it more specific to the job post. Remove vague or generic phrases. Tighten wording. Keep it concise. Do NOT increase length. Keep the same structure: HOOK / PROPOSAL / FOLLOW_UP",
        },
        {
          role: "user",
          content: `Draft to improve:\n${draftText}\n\nOriginal job post:\n${jobPost}`,
        },
      ],
      temperature: 0.7,
    });

    const improvedText = improvedCompletion.choices[0].message.content || "";

    // PHASE 3: HUMANIZATION
    const humanizedCompletion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Rewrite this to sound like a real human freelancer. Slightly informal, natural phrasing, not overly polished, vary sentence structure, allow slight imperfections, avoid robotic tone. Make it feel like a quick, thoughtful response—not a formal application. Keep structure: HOOK / PROPOSAL / FOLLOW_UP",
        },
        {
          role: "user",
          content: `Proposal to humanize:\n${improvedText}`,
        },
      ],
      temperature: 0.7,
    });

    const finalText = humanizedCompletion.choices[0].message.content || "";

    // PARSING
    const hook = finalText.split("HOOK:")[1]?.split("PROPOSAL:")[0]?.trim() || "";
    const proposal = finalText.split("PROPOSAL:")[1]?.split("FOLLOW_UP:")[0]?.trim() || "";
    const followUp = finalText.split("FOLLOW_UP:")[1]?.trim() || "";

    if (!hook || !proposal || !followUp) {
      console.error("Parsing failure. Raw output:", finalText);
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: finalText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hook,
      proposal,
      followUp,
    });

  } catch (error: any) {
    console.error("Pipeline Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
