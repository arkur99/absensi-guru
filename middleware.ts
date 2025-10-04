import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Fungsi untuk memverifikasi token JWT
function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as { userId: number; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  // Daftar rute yang dilindungi
  const protectedRoutes = [
    '/dashboard',
    '/guru',
    '/absensi',
    '/admin',
    // tambahkan rute lain yang perlu dilindungi
  ];

  // Cek apakah rute saat ini dilindungi
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Ambil token dari cookie atau header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect ke halaman login jika tidak ada token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verifikasi token
    const decoded = verifyToken(token);
    if (!decoded) {
      // Redirect ke halaman login jika token tidak valid
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Di sini kita bisa menambahkan logika untuk memeriksa role
    // Misalnya, hanya admin yang bisa mengakses beberapa rute
    const userRole = decoded.role;
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

    if (isAdminRoute && userRole !== 'admin') {
      // Arahkan ke halaman yang sesuai jika tidak memiliki akses
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Tambahkan informasi user ke header agar bisa diakses di route handler
    const response = NextResponse.next();
    response.headers.set('x-user-id', decoded.userId.toString());
    response.headers.set('x-user-role', userRole);
    return response;
  }

  // Untuk rute publik, biarkan request berjalan normal
  return NextResponse.next();
}

// Tentukan rute mana yang akan dijalani oleh middleware
export const config = {
  matcher: [
    /*
     * Jalankan middleware pada semua rute kecuali:
     * - Rute file statis (_next/static, _next/image, favicon.ico, dll)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};