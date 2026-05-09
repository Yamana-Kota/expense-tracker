import type { EntryType } from './entry';

/**
 * Geminiによるレシート解析結果の1件分の型
 */
export type ReceiptAnalysis = {
  date: string;
  type: EntryType;
  category: string;
  amount: number;
  note: string | null;
};

/**
 * Geminiによるレシート解析結果の配列型（カテゴリごとに分割された複数件）
 */
export type ReceiptAnalysisResult = ReadonlyArray<ReceiptAnalysis>;
