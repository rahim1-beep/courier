import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Branches ────────────────────────────────────────
  const lahore = await prisma.branch.upsert({
    where: { id: 'branch-lahore' },
    update: {},
    create: {
      id: 'branch-lahore',
      name: 'Lahore Branch',
      city: 'Lahore',
      address: '123 Mall Road, Lahore, Pakistan',
      allowedIPs: ['127.0.0.1', '::1'],
    },
  });

  const sialkot = await prisma.branch.upsert({
    where: { id: 'branch-sialkot' },
    update: {},
    create: {
      id: 'branch-sialkot',
      name: 'Sialkot Branch',
      city: 'Sialkot',
      address: '456 Cantt Area, Sialkot, Pakistan',
      allowedIPs: ['127.0.0.1', '::1'],
    },
  });

  console.log(`✅ Branches: ${lahore.name}, ${sialkot.name}`);

  // ── Super Admin ─────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@courier.com' },
    update: {},
    create: {
      email: 'admin@courier.com',
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.employee.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      branchId: lahore.id,
      name: 'System Admin',
      contact: '+923001234567',
      position: 'Super Administrator',
    },
  });

  console.log(`✅ Super Admin: admin@courier.com / admin123`);

  // ── Courier Services ────────────────────────────────
  const dhl = await prisma.service.upsert({
    where: { code: 'DHL' },
    update: {},
    create: { name: 'DHL Express', code: 'DHL' },
  });

  const fedex = await prisma.service.upsert({
    where: { code: 'FEDEX' },
    update: {},
    create: { name: 'FedEx International', code: 'FEDEX' },
  });

  console.log(`✅ Services: ${dhl.name}, ${fedex.name}`);

  // ── Service Countries ───────────────────────────────
  const countries = [
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'DE', name: 'Germany' },
  ];

  for (const service of [dhl, fedex]) {
    for (const country of countries) {
      await prisma.serviceCountry.upsert({
        where: {
          serviceId_countryCode: {
            serviceId: service.id,
            countryCode: country.code,
          },
        },
        update: {},
        create: {
          serviceId: service.id,
          countryCode: country.code,
          countryName: country.name,
        },
      });
    }
  }

  console.log(`✅ Service countries seeded`);

  // ── Sample Tariffs ──────────────────────────────────
  const tariffData = [
    { serviceId: dhl.id, countryCode: 'GB', pricePerKg: 15, basePrice: 500 },
    { serviceId: dhl.id, countryCode: 'US', pricePerKg: 20, basePrice: 800 },
    { serviceId: dhl.id, countryCode: 'AE', pricePerKg: 12, basePrice: 400 },
    { serviceId: fedex.id, countryCode: 'GB', pricePerKg: 14, basePrice: 450 },
    { serviceId: fedex.id, countryCode: 'US', pricePerKg: 18, basePrice: 750 },
    { serviceId: fedex.id, countryCode: 'AE', pricePerKg: 11, basePrice: 380 },
  ];

  for (const t of tariffData) {
    await prisma.tariff.create({ data: t });
  }

  console.log(`✅ Tariffs seeded`);
  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
