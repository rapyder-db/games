import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

const generateScoreCardSchema = z.object({
  name: z.string().trim().min(2).max(80),
  companyName: z.string().trim().min(2).max(120),
  score: z.number().int().min(0).max(10),
});

function toDataUrl(fileBuffer: Buffer) {
  return `data:image/png;base64,${fileBuffer.toString("base64")}`;
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = generateScoreCardSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  const { name, companyName, score } = parsed.data;

  try {
    if (process.env.VERCEL) {
      const forwardUrl = new URL("/api/generate-score-card-python", request.url);
      const response = await fetch(forwardUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, companyName, score }),
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: payload?.error ?? "Failed to generate score card" },
          { status: response.status },
        );
      }

      return NextResponse.json(payload);
    }

    const root = process.cwd();
    const scriptPath = path.join(root, "scripts", "generate_reward_card.py");
    const outputDir = path.join(root, "public", "generated-score-cards");
    const tempFilePath = path.join(
      outputDir,
      `local-score-card-${Date.now()}-${Math.random().toString(36).slice(2)}.png`,
    );

    await execFileAsync(
      "python",
      [
        scriptPath,
        "--template",
        "2",
        "--name",
        name,
        "--company",
        companyName,
        "--score",
        String(score),
        "--out",
        tempFilePath,
      ],
      { cwd: root },
    );

    const { readFile, unlink } = await import("node:fs/promises");
    const fileBuffer = await readFile(tempFilePath);
    await unlink(tempFilePath);

    return NextResponse.json({
      cardUrl: toDataUrl(fileBuffer),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate score card",
      },
      { status: 500 },
    );
  }
}
