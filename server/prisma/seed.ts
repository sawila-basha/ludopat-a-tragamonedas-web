import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Remove old insecure admin user if exists
  const oldEmail = 'admin@admin.com';
  const existingOldUser = await prisma.user.findUnique({ where: { email: oldEmail } });
  if (existingOldUser) {
    await prisma.user.delete({ where: { email: oldEmail } });
    console.log(`Old insecure admin user deleted: ${oldEmail}`);
  }

  // 2. Create new secure admin user
  const email = 'registroludopatas@safeplay.com';
  const password = 'Miraflores140'; 

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword, // Ensure password is updated if user exists
      role: 'ADMIN',
    },
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`Secure admin user configured: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
