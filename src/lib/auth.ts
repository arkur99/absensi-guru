import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface DecodedToken {
  userId: number;
  role: string;
}

// Fungsi untuk memverifikasi token JWT
export function verifyToken(token: string): DecodedToken | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Fungsi untuk mendapatkan informasi user dari request
export function getUserFromRequest(req: NextRequest): DecodedToken | null {
  // Cek token dari header Authorization
  const authHeader = req.headers.get('authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Jika tidak ada di header, coba dari cookie (jika middleware menambahkan informasi user)
  if (!token) {
    // Di sini kita bisa mengecek apakah middleware sudah menambahkan header
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (userId && userRole) {
      return {
        userId: parseInt(userId),
        role: userRole
      };
    }
  }

  if (token) {
    return verifyToken(token);
  }

  return null;
}

// Fungsi untuk memeriksa apakah user memiliki role tertentu
export function checkRole(user: DecodedToken | null, requiredRole: string): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

// Fungsi untuk memeriksa apakah user memiliki salah satu dari beberapa role
export function checkRoles(user: DecodedToken | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}