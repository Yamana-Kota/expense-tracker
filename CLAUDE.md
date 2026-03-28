# コーディング規約

このドキュメントはプロジェクトのコーディング規約を定義します。Claude Code はこのファイルを自動的に読み込み、開発作業に反映します。

## 技術スタック

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS

## ディレクトリ構成

```
app/          # Next.js App Router のページ・レイアウト
components/   # 再利用可能な UI コンポーネント
public/       # 静的ファイル
```

## ドキュメント

- 関数を作成したら JSDoc コメントを必ず記述すること
  - `/** ... */` 形式で関数の直前に記述する
  - 関数の目的・役割を日本語で説明する
  - 引数は `@param` タグ、戻り値は `@returns` タグで記述する
  - React コンポーネントも対象とする

## 一般

- 関数の中で関数を定義するのはなるべく避ける
- 大きな関数は、複数の小さな関数に分解して小さくする
- 引数が 5 個を超える場合は名前付き引数パターンを使う
- 使用していない変数・関数・型・ファイルなどは忘れずに削除すること
  - `export` しているものは消し忘れても警告されないので、差分を見て消し忘れがないかを確認すること
- ソースコードをコメントアウトして残さないこと。普通に削除する
- TODO コメントは `// TODO:` 形式で記述する

## TypeScript

- `any` 型の使用を禁止する
- 型推論が明確な場合は型注釈を省略してよい
- `interface` よりも `type` を優先する

### Optional と undefined の明示

optional プロパティ（`?:`）を使用する場合は、型に `| undefined` を明示してください。
関数の引数の optional は対象外です。

```typescript
// 誤
type Props = {
    label?: string;
};

// 正
type Props = {
    label?: string | undefined;
};
```

### namespace の使用制限

`namespace` ブロック内には `type`・`interface` の定義とその `export` のみ記述できます。
変数宣言・関数定義・クラス定義などランタイムに残るコードは記述できません（`*.d.ts` は除外）。

### exhaustiveness check

union 型の分岐には必ず exhaustiveness check を行ってください。switch-case も同様に default で `assertNever` を呼んでください。

```typescript
type Status = "active" | "inactive" | "pending";

function getLabel(status: Status): string {
    if (status === "active") return "有効";
    if (status === "inactive") return "無効";
    if (status === "pending") return "保留";
    return assertNever(status);
}

function assertNever(x: never): never {
    throw new Error("Unexpected value: " + x);
}
```

### 早期リターン

if-else よりも早期リターンを使用し、認知負荷を下げてください。

```typescript
// 誤
function convert(type: TheType): string {
    let returnedValue = "";
    if (type === "foo") {
        returnedValue = "FOO";
    } else {
        returnedValue = "BAR";
    }
    return returnedValue;
}

// 正
function convert(type: TheType): string {
    if (type === "foo") return "FOO";
    if (type === "bar") return "BAR";
    return assertNever(type);
}
```

## React / コンポーネント

- クラスコンポーネントは使用しないこと ⇒ 関数コンポーネントを使う (`function` キーワード推奨)
- ファイル名はコンポーネント名と一致させる (PascalCase)
- 1 ファイルに 1 コンポーネントを原則とする
- コンポーネントの中でコンポーネントを定義しない（再レンダー時にアンマウント・マウントが発生するため）
- プロパティ値は「内容が同じであれば `===` 比較が `true` になるような値を渡す」ようにする
  - `{ a, b, c }` や `[a, b, c]` のようなオブジェクト・配列リテラルは直接渡さないこと ⇒ `useMemo()` を使う
  - `() => doSomething()` のような関数式は直接渡さないこと ⇒ `useCallback()` を使う

### Props の型定義での `key` 禁止

Props の型エイリアスに `key` という名前の prop を定義してはいけません。React が内部で使用する特殊 props であるため。

### JSX の冗長な記述

不要な Fragment（子要素が 1 つの場合）、静的文字列への不要な波括弧、不要なテンプレートリテラルは使用しないこと。

```typescript
// 誤
return <><div /></>;
<Button label={"click"} />
const value = `${someString}`;

// 正
return <div />;
<Button label="click" />
const value = someString;
```

### JSX のネスト深さ・行数制限

- JSX のネストは最大 5 階層まで。超える場合はコンポーネントを分割する
- JSX を返す `return` 文の内容は最大 50 行。超える場合はコンポーネントを分割する

## MUI

- `<Grid>` コンポーネントの利用を避ける (CSS Flex ベースの実装で品質が低い)
- `xs` プロパティと `style` プロパティの利用を避ける ⇒ `styled()` を使う
- `component` プロパティの利用を避ける

## イミュータビリティ

state・props・`useMemo` の戻り値などはイミュータブルに扱ってください。

- `Array.prototype.push` などのミューテーションを伴うメソッドは使用しない
- 型引数に `ReadonlyArray<T>` や `Readonly<T>` を使用することで不変性を型で担保する

## useMemo / useCallback

`useMemo` に渡す関数は副作用を持たない純粋関数にしてください。

```typescript
// 誤: 副作用（現在時刻取得）を useMemo 内で実行している
const now = useMemo(() => new Date(), []);

// 正: 副作用を伴う初期値は useState を使用
const [now] = useState(() => new Date());
```

以下の目的での `useEffect` は避けてください（過渡状態での余計なレンダリングが発生するため）:

- props が変更されたときにすべての state をリセット → コンポーネント呼び出し側で `key` 属性を渡す
- props が変更されたときに一部の state を調整 → レンダリング中に条件付きで state を更新する、または `useMemo` を検討する

## 命名規則

### 基本ケース

| 対象 | ケース | 例 |
|------|--------|-----|
| 変数・関数 | camelCase | `fetchData`, `userId` |
| クラス・コンストラクタ・型 | PascalCase | `UserRecord` |
| ファイル名・ディレクトリ名（コンポーネント以外） | kebab-case（大文字禁止） | `node-list.tsx` |
| React コンポーネントのファイル名 | PascalCase | `UserCard.tsx`, `LoginPage.tsx` |
| CSS | kebab-case | |
| URL | kebab-case | |

React コンポーネント以外のファイル名・ディレクトリ名のパスセグメントに大文字を含めてはいけません。

頭文字語は普通の単語と同様に扱います。

| 良い例          | 悪い例          |
| --------------- | --------------- |
| `parseCsv`      | `parseCSV`      |
| `parseJson`     | `parseJSON`     |
| `nodeId`        | `nodeID`        |
| `handleIotData` | `handleIoTData` |

### 命名は一般的な英語の習慣に従う

- 関数名は動詞で始める
  - アクションを実行する関数は命令形にする (例: `add()`)
  - アクションを実行しない関数は命令形にしない (例: `contains()`)
- 関数以外の名前は動詞で始めない
  - 例外として、真偽値の変数は `isXxx` や `hasXxx` にしてもよい (推奨はしない)
- コレクション (配列・集合・マップ等) を扱う場合は複数形、それ以外は単数形にする
- 不可算名詞や既に複数形の名詞に `~s` をつけない (`infos`, `datas`, `medias` 等はすべて文法エラー)

### 単語を省略しない

| 良い例          | 悪い例                                       |
| --------------- | -------------------------------------------- |
| `flag`          | `flg`                                        |
| `attribute`     | `attr`                                       |
| `address`       | `addr`                                       |
| `element`       | `elm`                                        |
| `error`         | `err`                                        |
| `index`         | `i`                                          |
| `properties`    | `props` (例外: React の引数の型名は `Props`) |
| `response`      | `res`                                        |
| `result`        | `res`                                        |
| `returnedValue` | `ret`                                        |
| `request`       | `req`                                        |

### 意味が広い曖昧な単語を末尾につけない

`○○Info` や `○○Data` といった意味の広い単語を、明確な理由なく末尾につけない。コードの理解を助けず、名前を長くするだけです。

| 良い例            | 悪い例                 |
| ----------------- | ---------------------- |
| `node`            | `nodeData`, `nodeInfo` |
| `type User = ...` | `type UserType = ...`  |

### アンダースコアプレフィックス

使用している（読み取られている）変数を `_` で始めてはいけません。
未使用変数を示す目的のみに限り使用できます。
例外: `_`（lodash）、`__dirname`、`__filename`。

## ファイル構成・コード構造

- ファイルは使用場所の近くに配置する（ファイル種別ではなく機能・コンポーネント単位で管理）
- 共有ファイルは `shared/` または `common/` ディレクトリに配置する

### Helpers セクション

ファイル内でプライベートなヘルパー関数を定義する場合は、`// Helpers` コメントボックスを使用し、export しない宣言はその下に記述してください。

```typescript
export function publicFunction() { ... }

// ----------------------------------------
// Helpers
// ----------------------------------------

function privateHelper() { ... }
```

ルール:
- `Helpers` コメントボックスは 1 つだけ記述できます
- `Helpers` コメントより下に `export` 文は記述できません
- `export` しない関数・型の宣言は `Helpers` コメントより下に記述してください

## スタイリング

- Tailwind CSS のユーティリティクラスを優先する
- カスタム CSS は `globals.css` にまとめる
- インラインスタイルは使用しない（動的な値を含む場合は許可）
- CSS プロパティ値に `!important` を使用しない

## インポート順序

1. React / Next.js
2. サードパーティライブラリ
3. 内部モジュール (`@/` パス)
4. 型のインポート (`import type`)

## コードフォーマット

- JavaScript/TypeScript は Prettier に合わせます。

## その他のルール

### オブジェクトスプレッド

スプレッド対象がそのままオブジェクトリテラルである場合は展開してください。

```typescript
// 誤
const obj = { a: 1, ...{ b: 2, c: 3 } };

// 正
const obj = { a: 1, b: 2, c: 3 };
```

### Array.prototype.reduce

`reduce` をインラインの関数（アロー関数・関数式）で使用する場合は、直前に意図を説明するコメントを記述してください。

```typescript
// 各値の合計を計算する
const total = values.reduce((acc, val) => acc + val, 0);
```

### ESLint 無効化コメント

`eslint-disable-line` や `eslint-disable-next-line` を使用する際は、同じコメント内に無効化の理由を記述してください。

```typescript
// 誤
const x = value; // eslint-disable-line no-unused-vars

// 正
const x = value; // eslint-disable-line no-unused-vars -- ライブラリの型定義の都合上必要
```

## テストコード

### テストのスキップ

`skip` する場合は、直前に理由と解除予定時期を説明するコメントを記述してください。

```typescript
// 2026-04-01 までに対応予定。依存ライブラリの不具合のため一時スキップ。
it.skip("should work", () => { ... });
```

### フレイキーテスト対策

- 固定時間の待機（`sleep()` 等）は原則禁止。特定の状態・表示になるまで待機する
- 取得した DOM 要素を変数にキャッシュしない（再レンダリング後に古い参照になる場合がある）
- 自動待機するクエリを基本とする
- アサーションはリトライ付きで検証する
- デバッグ用の一時停止処理は本番コードにコミットしない

## セキュリティ

- API キー・パスワード・シークレットをリポジトリにコミットしない
- シークレットはシークレット管理サービスに保存する
- クライアントコードにシークレットを含めない（フロントエンドビルドは公開アクセス可能なため）
- 機密データは適切なアクセス制御と暗号化を行う

## コミットメッセージ

- 日本語で記述してよい
- Conventional Commits の派生で、絵文字を使ってコミットの種類を判別できるようにしています。これは、後にソースコードと変更履歴を分析するために利用します。そのため、プルリクエストの表題は絵文字で始めてください。
  - 1. 🗃️ DynamoDB GSI の変更がある (CloudFormation の不具合に対処するため区別したい)
  - 2. 💥 プロダクトに後方互換が無い変更がある
  - 3. ✨ プロダクトに新機能の追加がある
  - 4. 🐛 プロダクトに不具合の修正がある
  - 5. 🎨 プロダクトのソースコードに修正がある
  - 6. ✅ テストコードの修正がある (プロダクトに修正は無い)
  - 7. 📝 ドキュメントの修正がある (プロダクトに修正は無い)
  - 8. 🛠️ 開発環境や開発支援ツールの修正がある (プロダクトに修正は無い)

## コード品質チェック

ソースコードを作成・変更した後は、必ず以下のチェックをすべて実行し、エラーや警告がないことを確認すること。

```bash
npm run test:type    # TypeScript による静的型検証
npm run test:lint    # ESLint による静的検証
npm run test:format  # Prettier によるフォーマット違反の検出
```

### npm コマンドの実行方法

このプロジェクトでは Node.js を fnm で管理している。`npm` が PATH に存在しないため、Bash からコマンドを実行する際は事前に PATH を設定すること。

```bash
export PATH="/c/Users/kotayamana/AppData/Roaming/fnm/node-versions/v22.16.0/installation:$PATH"
npm run test:type
```
