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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "player";
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
  const root = process.cwd();
  const scriptPath = path.join(root, "scripts", "generate_reward_card.py");
  const outputDir = path.join(root, "public", "generated-score-cards");
  const slug = slugify(name);
  const timestamp = Date.now();
  const template1FileName = `score-card-template1-${slug}-${timestamp}.png`;
  const template2FileName = `score-card-template2-${slug}-${timestamp}.png`;
  const template1PublicPath = `/generated-score-cards/${template1FileName}`;
  const template2PublicPath = `/generated-score-cards/${template2FileName}`;
  const template1OutputPath = path.join(outputDir, template1FileName);
  const template2OutputPath = path.join(outputDir, template2FileName);

  try {
    await Promise.all([
      execFileAsync(
        "python",
        [
          scriptPath,
          "--template",
          "1",
          "--name",
          name,
          "--company",
          companyName,
          "--score",
          String(score),
          "--out",
          template1OutputPath,
        ],
        { cwd: root },
      ),
      execFileAsync(
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
          template2OutputPath,
        ],
        { cwd: root },
      ),
    ]);

    return NextResponse.json({
      cardPaths: {
        template1: template1PublicPath,
        template2: template2PublicPath,
      },
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
