import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const generateScoreCardSchema = z.object({
  name: z.string().trim().min(2).max(80),
  companyName: z.string().trim().min(2).max(120),
  score: z.number().int().min(0).max(10),
});

function normalizeScore(score: number) {
  return score <= 10 ? score * 10 : score;
}

function displayScore(score: number) {
  const normalized = normalizeScore(score);
  return normalized % 10 === 0 ? `${normalized / 10}/10` : `${normalized}/100`;
}

function titleFor(score: number) {
  const normalized = normalizeScore(score);

  if (normalized >= 95) return "CLOUD QUIZ CHAMPION";
  if (normalized >= 85) return "RAPYDER ELITE";
  if (normalized >= 75) return "CLOUD STRATEGIST";
  if (normalized >= 65) return "DATA RUNNER";
  return "ARCADE CONTENDER";
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function fitFontSize(text: string, maxWidth: number, maxSize: number, minSize: number, widthFactor: number) {
  let size = maxSize;

  while (size > minSize) {
    const estimatedWidth = text.length * size * widthFactor;
    if (estimatedWidth <= maxWidth) {
      return size;
    }
    size -= 1;
  }

  return minSize;
}

async function fileToDataUrl(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  const buffer = await readFile(filePath);

  if (extension === ".svg") {
    return `data:image/svg+xml;utf8,${encodeURIComponent(buffer.toString("utf8"))}`;
  }

  const mimeType =
    extension === ".jpg" || extension === ".jpeg"
      ? "image/jpeg"
      : extension === ".png"
        ? "image/png"
        : "application/octet-stream";

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
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

  try {
    const { name, companyName, score } = parsed.data;
    const root = process.cwd();
    const backgroundUrl = await fileToDataUrl(path.join(root, "public", "Template_Card 2.jpeg"));
    const logoUrl = await fileToDataUrl(path.join(root, "public", "rapyder-logo-clean.png"));

    const safeName = escapeXml(name.trim().toUpperCase());
    const safeCompany = escapeXml(companyName.trim().toUpperCase());
    const safeTitle = escapeXml(titleFor(score));
    const safeScore = escapeXml(displayScore(score));

    const titleFontSize = fitFontSize(safeTitle, 420, 30, 18, 0.62);
    const nameFontSize = fitFontSize(safeName, 560, 52, 28, 0.58);
    const companyFontSize = fitFontSize(safeCompany, 340, 22, 12, 0.58);

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1536" height="2816" viewBox="0 0 768 1408">
        <defs>
          <filter id="scoreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <image href="${backgroundUrl}" width="768" height="1408" />
        <image href="${logoUrl}" x="68" y="64" width="632" height="182" preserveAspectRatio="xMidYMid meet" />

        <g font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="middle">
          <text x="386" y="1212" font-size="${titleFontSize}" fill="#5a2600">${safeTitle}</text>
          <text x="384" y="1208" font-size="${titleFontSize}" fill="#FFD978">${safeTitle}</text>

          <text x="386" y="704" font-size="${nameFontSize}" fill="#5a2600">${safeName}</text>
          <text x="384" y="700" font-size="${nameFontSize}" fill="#FFD978">${safeName}</text>

          <text x="386" y="801" font-size="${companyFontSize}" fill="#5a2600">${safeCompany}</text>
          <text x="384" y="797" font-size="${companyFontSize}" fill="#FFD978">${safeCompany}</text>

          <text x="386" y="928" font-size="24" fill="#2f1400">SCORE</text>
          <text x="384" y="924" font-size="24" fill="#F7EBC7">SCORE</text>

          <text x="388" y="1055" font-size="76" fill="#FF915F" filter="url(#scoreGlow)">${safeScore}</text>
          <text x="388" y="1055" font-size="76" fill="#FFD76B">${safeScore}</text>
        </g>
      </svg>
    `.trim();

    return NextResponse.json({
      cardUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
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
