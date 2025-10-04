import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/guru/[id] - Mendapatkan data guru berdasarkan ID
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

    const guru = await prisma.guru.findUnique({
      where: { id },
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(guru);
  } catch (error) {
    console.error('Error fetching guru:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/guru/[id] - Memperbarui data guru
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

    const { name, nip } = await req.json();

    // Validasi input
    if (!name || !nip) {
      return NextResponse.json(
        { error: 'Name and NIP are required' },
        { status: 400 }
      );
    }

    // Cek apakah guru dengan ID tersebut ada
    const existingGuru = await prisma.guru.findUnique({
      where: { id },
    });

    if (!existingGuru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    // Cek apakah NIP sudah digunakan oleh guru lain
    const existingNip = await prisma.guru.findFirst({
      where: {
        nip,
        NOT: { id }, // Kecuali guru dengan ID ini
      },
    });

    if (existingNip) {
      return NextResponse.json(
        { error: 'NIP already exists' },
        { status: 409 }
      );
    }

    const updatedGuru = await prisma.guru.update({
      where: { id },
      data: {
        name,
        nip,
      },
    });

    return NextResponse.json(updatedGuru);
  } catch (error) {
    console.error('Error updating guru:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/guru/[id] - Menghapus data guru
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

    // Cek apakah guru dengan ID tersebut ada
    const existingGuru = await prisma.guru.findUnique({
      where: { id },
    });

    if (!existingGuru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    // Hapus guru
    await prisma.guru.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Guru deleted successfully' });
  } catch (error) {
    console.error('Error deleting guru:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}