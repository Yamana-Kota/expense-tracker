'use client';

import { useState, useCallback } from 'react';
import type { Entry } from '@/shared/entry';
import type { ReceiptAnalysisResult } from '@/shared/receipt';
import ReceiptEntryFormItem, { type FormEntry, parseAmountInput } from '@/components/tabs/ReceiptEntryFormItem';

type Props = {
  analysis: ReceiptAnalysisResult;
  isSaving: boolean;
  onSave: (entries: ReadonlyArray<Omit<Entry, 'id'>>) => void;
  onCancel: () => void;
};

/**
 * レシート解析結果の確認・編集フォーム
 *
 * Geminiが解析した複数の収支情報をカテゴリごとに一覧表示し、
 * 登録前にユーザーが各項目を編集できるフォームを提供する。
 *
 * @param analysis - Geminiが解析したレシート情報の配列（初期値として使用）
 * @param isSaving - 保存処理中フラグ
 * @param onSave - 登録ボタン押下時のコールバック
 * @param onCancel - キャンセルボタン押下時のコールバック
 */
export default function ReceiptReviewForm({ analysis, isSaving, onSave, onCancel }: Props) {
  const [entries, setEntries] = useState<ReadonlyArray<FormEntry>>(() =>
    analysis.map((item) => ({
      date: item.date,
      type: item.type,
      category: item.category,
      amount: item.amount.toLocaleString(),
      note: item.note ?? '',
    })),
  );

  const handleEntryChange = useCallback((index: number, updates: Partial<FormEntry>) => {
    setEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...updates } : entry)));
  }, []);

  const handleSubmit = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();
      const result = entries.map((entry) => ({
        date: entry.date,
        type: entry.type,
        category: entry.category,
        amount: parseAmountInput(entry.amount),
        note: entry.note || undefined,
      }));
      if (result.some((entry) => !entry.date || entry.amount <= 0)) return;
      onSave(result);
    },
    [entries, onSave],
  );

  const isValid = entries.every((entry) => !!entry.date && parseAmountInput(entry.amount) > 0);
  const saveLabel = isSaving ? '登録中…' : `${entries.length}件を登録する`;

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="mb-4 text-sm font-bold text-gray-900">解析結果を確認</h4>
      <div className="mb-4 space-y-3">
        {entries.map((entry, index) => (
          <ReceiptEntryFormItem
            key={index}
            entry={entry}
            index={index}
            onChange={handleEntryChange}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!isValid || isSaving}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saveLabel}
        </button>
      </div>
    </form>
  );
}
