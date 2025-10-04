import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/absensi - Mendapatkan semua data absensi
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const tanggal = searchParams.get('tanggal'); // Filter berdasarkan tanggal

    const whereClause: any = {};
    if (tanggal) {
      // Konversi tanggal ke format yang sesuai untuk pencarian
      const dateStart = new Date(tanggal + 'T00:00:00Z');
      const dateEnd = new Date(tanggal + 'T23:59:59Z');
      whereClause.tanggal = {
        gte: dateStart,
        lte: dateEnd,
      };
    }

    const absensis = await prisma.absensi.findMany({
      skip: offset,
      take: limit,
      where: whereClause,
      include: {
        guru: true, // Include informasi guru
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.absensi.count({
      where: whereClause,
    });

    return NextResponse.json({
      data: absensis,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching absensis:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/absensi - Membuat data absensi baru
export async function POST(req: NextRequest) {
  try {
    const { guruId, status, tanggal } = await req.json();

    // Validasi input
    if (!guruId || !status || !tanggal) {
      return NextResponse.json(
        { error: 'Guru ID, status, and tanggal are required' },
        { status: 400 }
      );
    }

    // Cek apakah guru dengan ID tersebut ada
    const existingGuru = await prisma.guru.findUnique({
      where: { id: guruId },
    });

    if (!existingGuru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    // Validasi status absensi
    const validStatuses = ['hadir', 'sakit', 'izin', 'alpa'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid status. Valid statuses are: hadir, sakit, izin, alpa' },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada absensi untuk guru dan tanggal yang sama
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        guruId,
        tanggal: {
          gte: new Date(tanggal + 'T00:00:00Z'),
          lte: new Date(tanggal + 'T23:59:59Z'),
        }
      },
    });

    if (existingAbsensi) {
      return NextResponse.json(
        { error: 'Absensi for this guru and date already exists' },
        { status: 409 }
      );
    }

    const newAbsensi = await prisma.absensi.create({
      data: {
        guruId,
        status,
        tanggal: new Date(tanggal),
      },
    });

    return NextResponse.json(newAbsensi, { status: 201 });
  } catch (error) {
    console.error('Error creating absensi:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}