import type { NextRequest } from "next/server";
import { z } from "zod";

// Owned by B2 (classifier).
// Contract:
//   POST { query: string }
//   200  { axisId: string, confidence: number, isOnTopic: boolean }
//   400  { error: string }
//   501  { error: "not implemented" }   <-- current
const ClassifyInput = z.object({
  query: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const parsed = ClassifyInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  return Response.json({ error: "not implemented", received: parsed.data }, { status: 501 });
}
