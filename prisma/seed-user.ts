import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Contoh penambahan user dengan role petugas
  const petugasRole = await prisma.role.findUnique({
    where: { name: 'petugas' },
  });

  if (petugasRole) {
    const existingUser = await prisma.user.findFirst({
      where: { email: 'petugas@example.com' },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('petugas123', 10);
      await prisma.user.create({
        data: {
          email: 'petugas@example.com',
          name: 'Petugas User',
          password: hashedPassword,
          roleId: petugasRole.id,
        },
      });
      console.log('Petugas user created successfully');
    } else {
      console.log('Petugas user already exists');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });