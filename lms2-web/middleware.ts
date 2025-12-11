import { NextResponse } from 'next/server';
import withAuth, { NextRequestWithAuth } from 'next-auth/middleware';

export default withAuth(function middleware(req: NextRequestWithAuth) {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.nextauth.token; // NextAuth が JWT を復号してくれる

  // ログイン済みで /login を開いたら TOP へ
  if (pathname === '/login' && isAuthed) {
    return NextResponse.redirect(new URL('/top', req.url));
  }

  // 他は勝手に遷移してくれる
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/top/:path*',
    '/document/:path*',
    '/question/:path*',
    '/review/:path*',
    '/examination/:path*'
  ] // ここは保護したいパスだけ
};

