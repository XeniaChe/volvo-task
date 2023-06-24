import { PrismaClient } from '@prisma/client';

import { customers } from './seeds/customers';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  for (const customer of customers) {
    const passHash = await argon.hash(customer.passHash);

    customer.passHash = passHash;

    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {},
      create: customer,
    });
  }
  console.log(`Created ${customers.length} customers`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
