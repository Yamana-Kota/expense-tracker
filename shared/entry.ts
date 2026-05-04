export type EntryType = 'expense' | 'income';

export type Entry = {
  id: string;
  date: string;
  type: EntryType;
  category: string;
  amount: number;
  note?: string | undefined;
};
