# 認証機能実装ドキュメント

## 概要

`next-auth` v5 (beta) と AWS Cognito を使ったログイン機能を実装した。

**採用バージョン: next-auth v5 (beta)**
React 19 / Next.js 16 との互換性のため v5 を採用。v4 と構成が異なり、中央設定ファイル `auth.ts` を起点にルートハンドラー・ミドルウェアが参照する構造になっている。

---

## ファイル構成

```
expense-tracker/
├── auth.ts                              # [新規] NextAuth 中央設定
├── middleware.ts                        # [新規] /dashboard 保護
├── app/
│   ├── layout.tsx                       # [修正] Providers でラップ
│   ├── page.tsx                         # [修正] SignInButton に差し替え
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts            # [新規] GET/POST ハンドラー
└── components/
    ├── Header.tsx                       # [修正] useSession で認証状態を表示
    ├── Providers.tsx                    # [新規] SessionProvider ラッパー
    └── SignInButton.tsx                 # [新規] signIn('cognito') ボタン
```

---

## 各ファイルの役割

### `auth.ts`（プロジェクトルート）

NextAuth の中央設定ファイル。CognitoProvider の設定と、各所で使うユーティリティ（`handlers` / `auth` / `signIn` / `signOut`）をエクスポートする。

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Cognito({ clientId, clientSecret, issuer })],
  pages: { signIn: '/' },  // 未認証時のリダイレクト先
});
```

使用する環境変数:

| 変数名 | 用途 |
|---|---|
| `COGNITO_CLIENT_ID` | Cognito アプリクライアント ID |
| `COGNITO_CLIENT_SECRET` | Cognito アプリクライアントシークレット |
| `COGNITO_ISSUER` | Cognito User Pool のエンドポイント |
| `NEXTAUTH_SECRET` | JWT 署名・暗号化に使うシークレット |
| `NEXTAUTH_URL` | アプリの正規 URL（例: `http://localhost:3000`） |

---

### `app/api/auth/[...nextauth]/route.ts`

next-auth が必要とする `GET` / `POST` の API ルートハンドラー。`auth.ts` の `handlers` を再エクスポートするだけのシンプルな構成。

```ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

---

### `components/Providers.tsx`

`SessionProvider` をクライアントコンポーネントとして切り出したラッパー。App Router のレイアウトはサーバーコンポーネントのため、クライアント専用の `SessionProvider` を直接配置できない制約を回避する。

```tsx
'use client';
export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

---

### `app/layout.tsx`（修正箇所）

`<body>` の中身を `<Providers>` でラップし、アプリ全体で `useSession` が使える状態にした。

```tsx
<body ...>
  <Providers>{children}</Providers>
</body>
```

---

### `components/Header.tsx`（修正箇所）

`useSession` でセッション状態を取得し、3 状態で表示を切り替える。

| `status` | 表示 |
|---|---|
| `'loading'` | ボタン非表示（チラつき防止） |
| `'authenticated'` | ログアウトボタン（`signOut({ callbackUrl: '/' })`） |
| `'unauthenticated'` | ログインボタン（`signIn('cognito')`） |

クライアントコンポーネント化（`'use client'` を追加）し、イベントハンドラーは `useCallback` でメモ化している。

---

### `middleware.ts`

`/dashboard` 配下へのアクセスを保護するミドルウェア。`auth.ts` の `auth` 関数をミドルウェアとして利用し、セッションがない場合はトップページ（`/`）にリダイレクトする。

```ts
export default auth((request) => {
  if (!request.auth) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

### `components/SignInButton.tsx`

トップページのメインボタン。サーバーコンポーネントである `app/page.tsx` から `signIn()` を呼べるようにするため、クライアントコンポーネントとして分離した。

```tsx
'use client';
export default function SignInButton() {
  const handleSignIn = useCallback(() => void signIn('cognito'), []);
  return <button onClick={handleSignIn}>...</button>;
}
```

---

## 認証フロー

```
ユーザー
  │
  ├─ トップページ (/) にアクセス
  │    └─ SignInButton をクリック
  │         └─ signIn('cognito') → Cognito ホスト UI へリダイレクト
  │              └─ 認証成功 → callbackUrl (/dashboard) へリダイレクト
  │
  └─ /dashboard に直接アクセス
       └─ middleware.ts が検査
            ├─ セッションあり → そのまま表示
            └─ セッションなし → / にリダイレクト
```

---

## Cognito 側の設定（別途必要）

Cognito ユーザープールのアプリクライアントに以下の設定が必要。

- **許可されたコールバック URL**: `http://localhost:3000/api/auth/callback/cognito`
- **許可されたサインアウト URL**: `http://localhost:3000`
- **OAuth フロー**: Authorization code grant を有効化
- **OAuth スコープ**: `openid`, `email`, `profile`
