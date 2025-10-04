import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Membuat roles
  await prisma.role.createMany({
    data: [
      { name: 'admin' },
      { name: 'petugas' },
      { name: 'manager' },
    ],
    skipDuplicates: true, // Lewati jika sudah ada
  });

  // Membuat user admin jika belum ada
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: 'admin@example.com',
    },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10); // Password default: admin123
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        roleId: 1, // roleId 1 adalah admin
      },
    });
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
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