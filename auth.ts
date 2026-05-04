import NextAuth from 'next-auth';
import Cognito from 'next-auth/providers/cognito';

/**
 * NextAuth の設定とユーティリティをエクスポートする
 *
 * handlers: API ルートハンドラー (GET/POST)
 * auth: セッション取得関数 (サーバーコンポーネント・ミドルウェアで使用)
 * signIn: サインイン関数
 * signOut: サインアウト関数
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? '';
      return session;
    },
  },
});
