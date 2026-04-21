import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const proposals = await prisma.proposal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("GET Proposals Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobPost, hook, proposal, followUp } = await req.json();

    const savedProposal = await prisma.proposal.create({
      data: {
        userId: session.user.id,
        jobPost,
        hook,
        proposal,
        followUp,
      },
    });

    return NextResponse.json(savedProposal);
  } catch (error) {
    console.error("POST Proposals Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
