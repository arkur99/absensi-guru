import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/guru - Mendapatkan semua data guru
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const gurus = await prisma.guru.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.guru.count();

    return NextResponse.json({
      data: gurus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching gurus:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/guru - Membuat data guru baru
export async function POST(req: NextRequest) {
  try {
    const { name, nip } = await req.json();

    // Validasi input
    if (!name || !nip) {
      return NextResponse.json(
        { error: 'Name and NIP are required' },
        { status: 400 }
      );
    }

    // Cek apakah NIP sudah ada
    const existingGuru = await prisma.guru.findUnique({
      where: { nip },
    });

    if (existingGuru) {
      return NextResponse.json(
        { error: 'NIP already exists' },
        { status: 409 }
      );
    }

    const newGuru = await prisma.guru.create({
      data: {
        name,
        nip,
      },
    });

    return NextResponse.json(newGuru, { status: 201 });
  } catch (error) {
    console.error('Error creating guru:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}