import type { NextRequest } from "next/server";
import { z } from "zod";

// Owned by B1 (RAG).
// Contract — frontend can build against this shape immediately:
//   POST { query: string, nation: "UK" | "ENG" | "SCO" | "WAL" | "NIR" }
//   200  { axisId: string, parties: Array<{ id, name, summary, citations: [{ quote, source }] }> }
//   400  { error: string }
//   501  { error: "not implemented" }   <-- current
const SearchInput = z.object({
  query: z.string().min(1).max(200),
  nation: z.enum(["UK", "ENG", "SCO", "WAL", "NIR"]).default("UK"),
});

export async function POST(req: NextRequest) {
  const parsed = SearchInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  return Response.json({ error: "not implemented", received: parsed.data }, { status: 501 });
}
