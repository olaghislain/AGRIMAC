import { PrismaClient, RoleCode, AccountStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seedPassword = process.env.SEED_PASSWORD || 'AGRIMAC_DEV_ONLY_CHANGE_ME_123!';

const roles: Array<{ code: RoleCode; label: string }> = [
  { code: RoleCode.AGRICULTEUR, label: 'Agriculteur' },
  { code: RoleCode.ENTREPRISE, label: 'Entreprise' },
  { code: RoleCode.MAINTENANCIER, label: 'Maintenancier' },
  { code: RoleCode.ADMINISTRATEUR, label: 'Administrateur' },
];

async function upsertRole(code: RoleCode, label: string) {
  return prisma.role.upsert({ where: { code }, update: { label }, create: { code, label } });
}

async function upsertUser(input: {
  phone: string;
  email: string;
  role: RoleCode;
  status: AccountStatus;
  displayName: string;
}) {
  const role = await prisma.role.findUniqueOrThrow({ where: { code: input.role } });
  // Authentication is intentionally out of scope for Phase 1. This placeholder
  // is not a usable password and must be replaced by the Auth phase.
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const user = await prisma.user.upsert({
    where: { phone: input.phone },
    update: { email: input.email, passwordHash, status: input.status, phoneVerifiedAt: new Date() },
    create: { phone: input.phone, email: input.email, passwordHash, status: input.status, phoneVerifiedAt: new Date() },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  if (input.role === RoleCode.AGRICULTEUR) {
    await prisma.farmerProfile.upsert({ where: { userId: user.id }, update: { firstName: input.displayName, lastName: 'Dev', city: 'Cotonou' }, create: { userId: user.id, firstName: input.displayName, lastName: 'Dev', city: 'Cotonou' } });
  } else if (input.role === RoleCode.ENTREPRISE) {
    await prisma.companyProfile.upsert({ where: { userId: user.id }, update: { legalName: input.displayName, city: 'Cotonou' }, create: { userId: user.id, legalName: input.displayName, city: 'Cotonou' } });
  } else if (input.role === RoleCode.MAINTENANCIER) {
    await prisma.technicianProfile.upsert({ where: { userId: user.id }, update: { displayName: input.displayName, city: 'Cotonou' }, create: { userId: user.id, displayName: input.displayName, city: 'Cotonou' } });
  } else {
    await prisma.adminProfile.upsert({ where: { userId: user.id }, update: { displayName: input.displayName }, create: { userId: user.id, displayName: input.displayName } });
  }
}

async function main() {
  await prisma.user.deleteMany({ where: { phone: { in: ['0100000001', '0100000002', '0100000003', '0100000004'] } } });
  for (const role of roles) await upsertRole(role.code, role.label);
  await upsertUser({ phone: '+2290100000001', email: 'dev.admin@agrimac.local', role: RoleCode.ADMINISTRATEUR, status: AccountStatus.ACTIVE, displayName: 'Admin Dev' });
  await upsertUser({ phone: '+2290100000002', email: 'dev.farmer@agrimac.local', role: RoleCode.AGRICULTEUR, status: AccountStatus.ACTIVE, displayName: 'Farmer Dev' });
  await upsertUser({ phone: '+2290100000003', email: 'dev.company@agrimac.local', role: RoleCode.ENTREPRISE, status: AccountStatus.APPROVED, displayName: 'Company Dev' });
  await upsertUser({ phone: '+2290100000004', email: 'dev.technician@agrimac.local', role: RoleCode.MAINTENANCIER, status: AccountStatus.APPROVED, displayName: 'Technician Dev' });
  const company = await prisma.companyProfile.findFirstOrThrow({ where: { legalName: 'Company Dev' } });
  const technician = await prisma.technicianProfile.findFirstOrThrow({ where: { displayName: 'Technician Dev' } });
  const machines = await prisma.category.upsert({ where: { slug: 'machines-agricoles' }, update: { name: 'Machines agricoles' }, create: { slug: 'machines-agricoles', name: 'Machines agricoles' } });
  const equipment = await prisma.category.upsert({ where: { slug: 'equipements' }, update: { name: 'Équipements' }, create: { slug: 'equipements', name: 'Équipements' } });
  await prisma.product.upsert({ where: { slug: 'tracteur-dev-90cv' }, update: { status: 'PUBLISHED' }, create: { companyId: company.id, categoryId: machines.id, title: 'Tracteur Dev 90 CV', slug: 'tracteur-dev-90cv', description: 'Machine de démonstration AGRIMAC.', kind: 'MACHINE', status: 'PUBLISHED', priceXof: 12500000, stock: 1, city: 'Cotonou', region: 'Littoral' } });
  await prisma.product.upsert({ where: { slug: 'motopompe-dev-3-pouces' }, update: { status: 'PUBLISHED' }, create: { companyId: company.id, categoryId: equipment.id, title: 'Motopompe Dev 3 pouces', slug: 'motopompe-dev-3-pouces', description: 'Équipement de démonstration AGRIMAC.', kind: 'PRODUCT', status: 'PUBLISHED', priceXof: 185000, stock: 6, city: 'Cotonou', region: 'Littoral' } });
  await prisma.service.upsert({ where: { slug: 'maintenance-moteur-dev' }, update: { status: 'PUBLISHED' }, create: { technicianId: technician.id, categoryId: machines.id, title: 'Maintenance moteur agricole', slug: 'maintenance-moteur-dev', description: 'Service de démonstration AGRIMAC.', status: 'PUBLISHED', priceXof: 35000, city: 'Cotonou', region: 'Littoral' } });
  await prisma.technicianZone.deleteMany({ where: { technicianId: technician.id, name: 'Cotonou' } });
  await prisma.technicianZone.create({ data: { technicianId: technician.id, name: 'Cotonou', city: 'Cotonou', region: 'Littoral', radiusKm: 20, active: true } });
  await prisma.availabilitySlot.upsert({ where: { technicianId_dayOfWeek: { technicianId: technician.id, dayOfWeek: 1 } }, update: { startTime: '08:00', endTime: '17:00', status: 'AVAILABLE' }, create: { technicianId: technician.id, dayOfWeek: 1, startTime: '08:00', endTime: '17:00', status: 'AVAILABLE' } });
  console.log('AGRIMAC development seed completed. Password is the documented SEED_PASSWORD value only.');
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
