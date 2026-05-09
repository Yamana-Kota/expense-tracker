import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@/auth';
import { buildReceiptPrompt } from './prompt';
import type { ReceiptAnalysisResult } from '@/shared/receipt';

const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

/**
 * レシート画像をGemini Vision APIで解析して収支情報をJSON配列で返す
 *
 * multipart/form-dataで受け取った画像をGeminiに渡し、
 * カテゴリごとに分割された日付・種別・カテゴリ・金額・メモの配列を返す。
 *
 * @param request - 画像ファイルを含むmultipart/form-dataリクエスト（フィールド名: image）
 * @returns ReceiptAnalysisResultの配列
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key not configured' },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('image');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image is required' }, { status: 400 });
  }

  if (!isSupportedImageType(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported image type' },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const today = new Date().toISOString().split('T')[0] ?? '';

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent([
    { text: buildReceiptPrompt(today) },
    { inlineData: { mimeType: file.type, data: base64 } },
  ]);

  let analysis: ReceiptAnalysisResult;
  try {
    analysis = JSON.parse(result.response.text()) as ReceiptAnalysisResult;
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse Gemini response' },
      { status: 500 },
    );
  }

  return NextResponse.json(analysis);
}

// ----------------------------------------
// Helpers
// ----------------------------------------

function isSupportedImageType(mimeType: string): mimeType is SupportedImageType {
  return (SUPPORTED_IMAGE_TYPES as ReadonlyArray<string>).includes(mimeType);
}
