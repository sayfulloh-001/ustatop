import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial system data...');

  const adminPhone = process.env.ADMIN_PHONE || '+998901234567';

  // Seed Admin user
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { role: 'ADMIN' },
    create: {
      phone: adminPhone,
      firstName: 'Admin',
      lastName: 'Sayfulloh',
      role: 'ADMIN',
    },
  });

  console.log(`Admin user ready: ${admin.phone} (${admin.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
