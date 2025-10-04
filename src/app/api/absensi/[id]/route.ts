import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/absensi/[id] - Mendapatkan data absensi berdasarkan ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const absensi = await prisma.absensi.findUnique({
      where: { id },
      include: {
        guru: true, // Include informasi guru
      },
    });

    if (!absensi) {
      return NextResponse.json(
        { error: 'Absensi not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(absensi);
  } catch (error) {
    console.error('Error fetching absensi:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/absensi/[id] - Memperbarui data absensi
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const { guruId, status, tanggal } = await req.json();

    // Validasi input
    if (!guruId || !status || !tanggal) {
      return NextResponse.json(
        { error: 'Guru ID, status, and tanggal are required' },
        { status: 400 }
      );
    }

    // Cek apakah absensi dengan ID tersebut ada
    const existingAbsensi = await prisma.absensi.findUnique({
      where: { id },
    });

    if (!existingAbsensi) {
      return NextResponse.json(
        { error: 'Absensi not found' },
        { status: 404 }
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

    const updatedAbsensi = await prisma.absensi.update({
      where: { id },
      data: {
        guruId,
        status,
        tanggal: new Date(tanggal),
      },
    });

    return NextResponse.json(updatedAbsensi);
  } catch (error) {
    console.error('Error updating absensi:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/absensi/[id] - Menghapus data absensi
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Cek apakah absensi dengan ID tersebut ada
    const existingAbsensi = await prisma.absensi.findUnique({
      where: { id },
    });

    if (!existingAbsensi) {
      return NextResponse.json(
        { error: 'Absensi not found' },
        { status: 404 }
      );
    }

    // Hapus absensi
    await prisma.absensi.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Absensi deleted successfully' });
  } catch (error) {
    console.error('Error deleting absensi:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}