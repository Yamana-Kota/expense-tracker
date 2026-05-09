'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ImagePlus, RefreshCw, ScanLine } from 'lucide-react';
import ReceiptReviewForm from '@/components/tabs/ReceiptReviewForm';
import type { Entry } from '@/shared/entry';
import type { ReceiptAnalysisResult } from '@/shared/receipt';

/**
 * レシートタブコンポーネント
 *
 * 画像ファイルを選択してGeminiで解析し、解析結果を確認・編集して収支を登録する。
 * 登録前に日付・種別・カテゴリ・金額・メモを手動で修正できる。
 */
export default function ReceiptTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReceiptAnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleOpenFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = event.target.files?.[0];
      if (!selected) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setAnalysis(null);
      setAnalysisError(null);
    },
    [previewUrl],
  );

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setAnalysis(null);
    setIsSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl]);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/receipt', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      setAnalysisError('解析に失敗しました。画像を確認して再度お試しください。');
      setIsAnalyzing(false);
      return;
    }

    const result = (await response.json()) as ReceiptAnalysisResult;
    setAnalysis(result);
    setIsAnalyzing(false);
  }, [file]);

  const handleSave = useCallback(
    async (entries: ReadonlyArray<Omit<Entry, 'id'>>) => {
      setIsSaving(true);
      for (const entry of entries) {
        const response = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        if (!response.ok) {
          setIsSaving(false);
          return;
        }
      }
      handleReset();
    },
    [handleReset],
  );

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        onChange={handleFileChange}
        className="hidden"
      />

      {!file && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-blue-100 p-5">
              <ImagePlus className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">レシートをアップロード</p>
              <p className="mt-1 text-sm text-gray-500">画像を選択するだけで自動で家計簿に記録されます</p>
            </div>
            <button
              onClick={handleOpenFilePicker}
              className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95"
            >
              ファイルを選択
            </button>
          </div>
        </div>
      )}

      {file && previewUrl && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URLはnext/imageが対応していないためimg要素を使用 */}
          <img src={previewUrl} alt="レシートプレビュー" className="mx-auto mb-4 max-h-64 rounded-lg object-contain" />
          {analysisError && (
            <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{analysisError}</p>
          )}
          {!analysis && (
            <div className="flex gap-2">
              <button onClick={handleReset} className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
                <RefreshCw className="h-4 w-4" />
                やり直す
              </button>
              <button onClick={handleAnalyze} disabled={isAnalyzing} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                <ScanLine className="h-4 w-4" />
                {isAnalyzing ? '解析中…' : '解析する'}
              </button>
            </div>
          )}
        </div>
      )}

      {analysis && (
        <ReceiptReviewForm
          analysis={analysis}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleReset}
        />
      )}
    </div>
  );
}
